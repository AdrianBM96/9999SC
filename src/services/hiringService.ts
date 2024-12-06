import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { HiringProcess, DocumentTemplate, OnboardingTask } from '../types';
import { createEnvelope, getEnvelopeStatus, updateDocumentStatus } from './docusignService';

export async function createHiringProcess(hiringData: Omit<HiringProcess, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const hiringProcess = {
      ...hiringData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'hiringProcesses'), hiringProcess);
    return docRef.id;
  } catch (error) {
    console.error('Error creating hiring process:', error);
    throw error;
  }
}

export async function updateHiringProcess(processId: string, updates: Partial<HiringProcess>): Promise<void> {
  try {
    const processRef = doc(db, 'hiringProcesses', processId);
    await updateDoc(processRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating hiring process:', error);
    throw error;
  }
}

export async function createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const templateData = {
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'documentTemplates'), templateData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating document template:', error);
    throw error;
  }
}

export async function sendDocumentForSignature(
  hiringProcessId: string,
  documentId: string,
  recipientEmail: string,
  recipientName: string
): Promise<void> {
  try {
    const hiringProcessRef = doc(db, 'hiringProcesses', hiringProcessId);
    const hiringProcess = await getDoc(hiringProcessRef);
    
    if (!hiringProcess.exists()) {
      throw new Error('Hiring process not found');
    }

    const processData = hiringProcess.data() as HiringProcess;
    const document = processData.documents.find(doc => doc.id === documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    const envelopeId = await createEnvelope({
      documentId: document.id,
      documentName: document.name,
      documentContent: document.url,
      signerEmail: recipientEmail,
      signerName: recipientName,
    });

    await updateDoc(hiringProcessRef, {
      'documents': processData.documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'sent', signatureId: envelopeId }
          : doc
      ),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending document for signature:', error);
    throw error;
  }
}

export async function createOnboardingTask(task: Omit<OnboardingTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const taskData = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'onboardingTasks'), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating onboarding task:', error);
    throw error;
  }
}

export async function updateOnboardingTask(taskId: string, updates: Partial<OnboardingTask>): Promise<void> {
  try {
    const taskRef = doc(db, 'onboardingTasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating onboarding task:', error);
    throw error;
  }
}

export async function checkDocumentStatus(hiringProcessId: string, documentId: string): Promise<void> {
  try {
    const hiringProcessRef = doc(db, 'hiringProcesses', hiringProcessId);
    const hiringProcess = await getDoc(hiringProcessRef);
    
    if (!hiringProcess.exists()) {
      throw new Error('Hiring process not found');
    }

    const processData = hiringProcess.data() as HiringProcess;
    const document = processData.documents.find(doc => doc.id === documentId);

    if (!document || !document.signatureId) {
      throw new Error('Document or signature ID not found');
    }

    const status = await getEnvelopeStatus(document.signatureId);
    await updateDocumentStatus(documentId, hiringProcessId, status);
  } catch (error) {
    console.error('Error checking document status:', error);
    throw error;
  }
}
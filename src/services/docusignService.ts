import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DOCUSIGN_API_URL = 'https://demo.docusign.net/restapi/v2.1';
const DOCUSIGN_INTEGRATION_KEY = import.meta.env.VITE_DOCUSIGN_INTEGRATION_KEY;
const DOCUSIGN_ACCOUNT_ID = import.meta.env.VITE_DOCUSIGN_ACCOUNT_ID;

interface DocusignEnvelope {
  envelopeId: string;
  status: string;
  documentsUri: string;
  recipientsUri: string;
}

const docusignApi = axios.create({
  baseURL: DOCUSIGN_API_URL,
  headers: {
    'Authorization': `Bearer ${DOCUSIGN_INTEGRATION_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function createEnvelope(documentData: {
  documentId: string;
  documentName: string;
  documentContent: string;
  signerEmail: string;
  signerName: string;
}): Promise<string> {
  try {
    const response = await docusignApi.post(`/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`, {
      emailSubject: `Please sign ${documentData.documentName}`,
      documents: [{
        documentId: '1',
        name: documentData.documentName,
        fileExtension: 'pdf',
        documentBase64: documentData.documentContent,
      }],
      recipients: {
        signers: [{
          email: documentData.signerEmail,
          name: documentData.signerName,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              documentId: '1',
              pageNumber: '1',
              xPosition: '100',
              yPosition: '100',
            }],
          },
        }],
      },
      status: 'sent',
    });

    return response.data.envelopeId;
  } catch (error) {
    console.error('Error creating DocuSign envelope:', error);
    throw error;
  }
}

export async function getEnvelopeStatus(envelopeId: string): Promise<string> {
  try {
    const response = await docusignApi.get(`/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}`);
    return response.data.status;
  } catch (error) {
    console.error('Error getting envelope status:', error);
    throw error;
  }
}

export async function updateDocumentStatus(documentId: string, hiringProcessId: string, status: string): Promise<void> {
  try {
    const hiringProcessRef = doc(db, 'hiringProcesses', hiringProcessId);
    await updateDoc(hiringProcessRef, {
      'documents': {
        [documentId]: {
          status: status,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
}

export async function downloadSignedDocument(envelopeId: string, documentId: string): Promise<string> {
  try {
    const response = await docusignApi.get(
      `/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error downloading signed document:', error);
    throw error;
  }
}
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Candidate } from '../types/campaign';

interface CVProcessingResult {
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  languages: string[];
}

export async function processCVWithAI(
  candidateId: string, 
  cvText: string, 
  linkedinData: any
): Promise<void> {
  try {
    // Call OpenAI API to process CV text
    const response = await fetch('/api/process-cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cvText, linkedinData }),
    });

    if (!response.ok) {
      throw new Error('Failed to process CV with AI');
    }

    const result: CVProcessingResult = await response.json();

    // Update candidate profile with merged information
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      skills: mergeArrays(result.skills, linkedinData.skills),
      experience: mergeExperience(result.experience, linkedinData.experience),
      education: mergeEducation(result.education, linkedinData.education),
      languages: mergeArrays(result.languages, linkedinData.languages),
      lastUpdated: new Date().toISOString(),
      cvProcessed: true
    });

  } catch (error) {
    console.error('Error processing CV:', error);
    throw error;
  }
}

function mergeArrays(arr1: string[], arr2: string[]): string[] {
  return Array.from(new Set([...arr1, ...arr2]));
}

function mergeExperience(cvExp: any[], linkedinExp: any[]): any[] {
  const merged = [...cvExp];
  linkedinExp.forEach(linkedinItem => {
    const exists = merged.some(cvItem => 
      cvItem.company.toLowerCase() === linkedinItem.company.toLowerCase() &&
      cvItem.position.toLowerCase() === linkedinItem.position.toLowerCase()
    );
    if (!exists) {
      merged.push(linkedinItem);
    }
  });
  return merged;
}

function mergeEducation(cvEdu: any[], linkedinEdu: any[]): any[] {
  const merged = [...cvEdu];
  linkedinEdu.forEach(linkedinItem => {
    const exists = merged.some(cvItem => 
      cvItem.institution.toLowerCase() === linkedinItem.institution.toLowerCase() &&
      cvItem.degree.toLowerCase() === linkedinItem.degree.toLowerCase()
    );
    if (!exists) {
      merged.push(linkedinItem);
    }
  });
  return merged;
}

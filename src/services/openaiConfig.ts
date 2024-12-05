import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface OpenAIConfig {
  apiKey: string;
  orgId?: string;
}

export async function saveOpenAIConfig(user: User, config: OpenAIConfig): Promise<void> {
  const userConfigRef = doc(db, 'userConfigs', user.uid);
  
  try {
    const docSnap = await getDoc(userConfigRef);
    
    if (docSnap.exists()) {
      await updateDoc(userConfigRef, {
        openai: {
          apiKey: config.apiKey,
          orgId: config.orgId
        }
      });
    } else {
      await setDoc(userConfigRef, {
        openai: {
          apiKey: config.apiKey,
          orgId: config.orgId
        }
      });
    }
  } catch (error) {
    console.error('Error saving OpenAI config:', error);
    throw new Error('Failed to save OpenAI configuration');
  }
}

export async function getOpenAIConfig(user: User): Promise<OpenAIConfig | null> {
  if (!user) return null;
  
  const userConfigRef = doc(db, 'userConfigs', user.uid);
  
  try {
    const docSnap = await getDoc(userConfigRef);
    if (docSnap.exists() && docSnap.data().openai) {
      return docSnap.data().openai as OpenAIConfig;
    }
    return null;
  } catch (error) {
    console.error('Error getting OpenAI config:', error);
    throw new Error('Failed to retrieve OpenAI configuration');
  }
}
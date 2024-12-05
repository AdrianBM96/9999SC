import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase';

interface CalendarConnection {
  connected: boolean;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface LinkedInConnection {
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

class SettingsService {
  private async getUserSettingsRef() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    return doc(db, 'userSettings', user.uid);
  }

  async getLinkedInConnection(): Promise<LinkedInConnection> {
    const settingsRef = await this.getUserSettingsRef();
    const settings = await getDoc(settingsRef);
    return settings.data()?.linkedIn || { connected: false };
  }

  async getCalendarConnection(provider: 'google' | 'microsoft'): Promise<CalendarConnection> {
    const settingsRef = await this.getUserSettingsRef();
    const settings = await getDoc(settingsRef);
    return settings.data()?.[`${provider}Calendar`] || { connected: false };
  }

  async connectLinkedIn(): Promise<void> {
    // Open LinkedIn OAuth popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    const popup = window.open(
      `${apiUrl}/auth/linkedin`,
      'LinkedIn Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      return new Promise((resolve, reject) => {
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== apiUrl) return;
          if (event.data.type === 'linkedin_auth') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            if (event.data.success) {
              const settingsRef = await this.getUserSettingsRef();
              await updateDoc(settingsRef, {
                linkedIn: {
                  connected: true,
                  accessToken: event.data.accessToken,
                  refreshToken: event.data.refreshToken,
                  expiresAt: event.data.expiresAt,
                },
              });
              resolve();
            } else {
              reject(new Error('LinkedIn authentication failed'));
            }
          }
        };

        window.addEventListener('message', messageHandler);
        // Add timeout to clean up if the popup is closed without completing
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication window was closed'));
          }
        }, 1000);
      });
    }
  }

  async connectGoogleCalendar(): Promise<void> {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    const popup = window.open(
      `${apiUrl}/auth/google`,
      'Google Calendar Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      return new Promise((resolve, reject) => {
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== apiUrl) return;
          if (event.data.type === 'google_auth') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            if (event.data.success) {
              const settingsRef = await this.getUserSettingsRef();
              await updateDoc(settingsRef, {
                googleCalendar: {
                  connected: true,
                  email: event.data.email,
                  accessToken: event.data.accessToken,
                  refreshToken: event.data.refreshToken,
                  expiresAt: event.data.expiresAt,
                },
              });
              resolve();
            } else {
              reject(new Error('Google Calendar authentication failed'));
            }
          }
        };

        window.addEventListener('message', messageHandler);
        // Add timeout to clean up if the popup is closed without completing
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication window was closed'));
          }
        }, 1000);
      });
    }
  }

  async connectMicrosoftCalendar(): Promise<void> {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    const popup = window.open(
      `${apiUrl}/auth/microsoft`,
      'Microsoft Calendar Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      return new Promise((resolve, reject) => {
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== apiUrl) return;
          if (event.data.type === 'microsoft_auth') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            if (event.data.success) {
              const settingsRef = await this.getUserSettingsRef();
              await updateDoc(settingsRef, {
                microsoftCalendar: {
                  connected: true,
                  email: event.data.email,
                  accessToken: event.data.accessToken,
                  refreshToken: event.data.refreshToken,
                  expiresAt: event.data.expiresAt,
                },
              });
              resolve();
            } else {
              reject(new Error('Microsoft Calendar authentication failed'));
            }
          }
        };

        window.addEventListener('message', messageHandler);
        // Add timeout to clean up if the popup is closed without completing
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication window was closed'));
          }
        }, 1000);
      });
    }
  }

  async disconnectLinkedIn(): Promise<void> {
    const settingsRef = await this.getUserSettingsRef();
    await updateDoc(settingsRef, {
      linkedIn: {
        connected: false,
      },
    });
  }

  async disconnectGoogleCalendar(): Promise<void> {
    const settingsRef = await this.getUserSettingsRef();
    await updateDoc(settingsRef, {
      googleCalendar: {
        connected: false,
      },
    });
  }

  async disconnectMicrosoftCalendar(): Promise<void> {
    const settingsRef = await this.getUserSettingsRef();
    await updateDoc(settingsRef, {
      microsoftCalendar: {
        connected: false,
      },
    });
  }
}

export const settingsService = new SettingsService();

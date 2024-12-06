import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthState({
                isAuthenticated: !!user,
                user
            });
        });

        return () => unsubscribe();
    }, []);

    return authState;
}
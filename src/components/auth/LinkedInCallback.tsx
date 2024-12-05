import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLinkedInAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }

        // TODO: Send the code to your backend to complete LinkedIn OAuth
        // const response = await fetch('/api/auth/linkedin/callback', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ code, state })
        // });

        // Redirect back to settings/accounts after successful auth
        navigate('/settings/accounts');
      } catch (error) {
        console.error('LinkedIn authentication error:', error);
        // Redirect back to settings/accounts with error
        navigate('/settings/accounts?error=linkedin_auth_failed');
      }
    };

    handleLinkedInAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Conectando con LinkedIn...</h2>
        <p className="text-gray-500 mt-2">Por favor, espera mientras procesamos tu autenticación.</p>
      </div>
    </div>
  );
}
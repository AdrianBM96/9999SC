import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { handleUnileapCallback } from '../../services/unileap';
import { toast } from 'react-toastify';

export function UnileapCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (!user) {
        toast.error('Usuario no autenticado');
        navigate('/settings/accounts');
        return;
      }

      const success = searchParams.get('success') === 'true';
      const error = searchParams.get('error');
      const accountId = searchParams.get('account_id');
      const isReconnect = searchParams.get('reconnect') === 'true';

      try {
        if (success && accountId) {
          await handleUnileapCallback(user.uid, accountId);
          toast.success(isReconnect ? 'Cuenta de LinkedIn reconectada exitosamente' : 'Cuenta de LinkedIn conectada exitosamente');
        } else if (error) {
          toast.error('Error al conectar cuenta de LinkedIn');
        }
      } catch (error) {
        console.error('Error handling Unileap callback:', error);
        toast.error('Error al procesar la conexión de LinkedIn');
      } finally {
        // Always redirect back to accounts page
        navigate('/settings/accounts');
      }
    };

    handleCallback();
  }, [navigate, searchParams, user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Procesando conexión...</h2>
        <p className="text-gray-500 mt-2">Por favor, espera mientras finalizamos la configuración.</p>
      </div>
    </div>
  );
}
import React from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ContinueButtonProps {
  isValid: boolean;
  onClick: () => void;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  loadingMessage?: string;
}

export function ContinueButton({ 
  isValid, 
  onClick, 
  loading = false,
  error,
  successMessage,
  loadingMessage = 'Procesando...'
}: ContinueButtonProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <div className="flex-1 mr-4">
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
        {!error && successMessage && (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      <button
        onClick={onClick}
        disabled={!isValid || loading}
        className={`
          inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
          transition-colors duration-150 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${
            loading
              ? 'bg-blue-500 text-white cursor-wait'
              : isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {loadingMessage}
          </>
        ) : (
          <>
            <span>Continuar</span>
            <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

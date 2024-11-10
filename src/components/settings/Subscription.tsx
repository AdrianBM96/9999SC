import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Básico',
    price: '29',
    features: [
      'Hasta 5 usuarios',
      '100 candidaturas al mes',
      'Soporte por email',
    ],
  },
  {
    name: 'Pro',
    price: '99',
    features: [
      'Hasta 20 usuarios',
      'Candidaturas ilimitadas',
      'Soporte prioritario',
      'Integraciones avanzadas',
    ],
  },
  {
    name: 'Empresa',
    price: 'Personalizado',
    features: [
      'Usuarios ilimitados',
      'Candidaturas ilimitadas',
      'Soporte 24/7',
      'Integraciones personalizadas',
      'Formación dedicada',
    ],
  },
];

export function Subscription() {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900">Subscripción y Facturas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="border rounded-lg shadow-sm p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="mt-4 text-3xl font-bold text-gray-900">
              {plan.price === 'Personalizado' ? (
                'Personalizado'
              ) : (
                <>
                  {plan.price}€ <span className="text-base font-medium text-gray-500">/mes</span>
                </>
              )}
            </p>
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
            <button
              className="mt-8 block w-full bg-red-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-red-700"
            >
              {plan.price === 'Personalizado' ? 'Contactar' : 'Seleccionar plan'}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Facturas</h4>
        <p className="text-gray-600">El historial de facturas estará disponible próximamente.</p>
      </div>
    </div>
  );
}
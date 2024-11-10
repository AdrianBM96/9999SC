import React, { useState } from 'react';
import { Mail, Phone, Edit2, Save } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../../types';

interface ContactTabProps {
  candidate: DetailedLinkedInProfile;
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onUpdateContact: (updates: Partial<DetailedLinkedInProfile>) => void;
}

export function ContactTab({
  candidate,
  isEditing,
  onSave,
  onEdit,
  onCancel,
  onUpdateContact
}: ContactTabProps) {
  const [phoneNumber, setPhoneNumber] = useState(candidate.phone || '');
  const [email, setEmail] = useState(candidate.email || '');

  const handleSave = () => {
    onUpdateContact({ phone: phoneNumber, email });
    onSave();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-blue-600 border-b pb-2">Información de contacto</h4>
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit2 size={18} />
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Número de teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
              >
                <Save size={18} className="mr-2" />
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{candidate.phone || 'No disponible'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{candidate.email || 'No disponible'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
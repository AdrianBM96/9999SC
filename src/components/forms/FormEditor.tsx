import React, { useState } from 'react';
import { X, Plus, Save, Trash2, Move } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { RecruitmentForm, FormField } from '../../types';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface FormEditorProps {
  form: RecruitmentForm | null;
  onClose: () => void;
  onSave: (form: RecruitmentForm) => void;
}

export function FormEditor({ form, onClose, onSave }: FormEditorProps) {
  const [title, setTitle] = useState(form?.title || '');
  const [description, setDescription] = useState(form?.description || '');
  const [fields, setFields] = useState<FormField[]>(form?.fields || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleFieldChange = (index: number, updates: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (fields.some(field => !field.label.trim())) {
      toast.error('Todos los campos deben tener una etiqueta');
      return;
    }

    setIsSaving(true);
    try {
      const formData = {
        title,
        description,
        fields,
        status: 'active',
        submissions: form?.submissions || 0,
        updatedAt: new Date().toISOString(),
        ...(form ? {} : { createdAt: new Date().toISOString() })
      };

      if (form) {
        await updateDoc(doc(db, 'recruitmentForms', form.id), formData);
        onSave({ ...formData, id: form.id } as RecruitmentForm);
      } else {
        const docRef = await addDoc(collection(db, 'recruitmentForms'), formData);
        onSave({ ...formData, id: docRef.id } as RecruitmentForm);
      }

      toast.success(`Formulario ${form ? 'actualizado' : 'creado'} con éxito`);
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error(`Error al ${form ? 'actualizar' : 'crear'} el formulario`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {form ? 'Editar Formulario' : 'Nuevo Formulario'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Título del formulario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
                placeholder="Descripción del formulario"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Campos del formulario</h3>
                <button
                  onClick={handleAddField}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Añadir campo
                </button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-gray-50 p-4 rounded-lg mb-4"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div {...provided.dragHandleProps} className="cursor-move">
                                  <Move size={20} className="text-gray-500" />
                                </div>
                                <button
                                  onClick={() => handleRemoveField(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Etiqueta
                                  </label>
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Tipo de campo
                                  </label>
                                  <select
                                    value={field.type}
                                    onChange={(e) => handleFieldChange(index, { type: e.target.value as FormField['type'] })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                  >
                                    <option value="text">Texto corto</option>
                                    <option value="textarea">Texto largo</option>
                                    <option value="select">Selección</option>
                                    <option value="radio">Opción única</option>
                                    <option value="checkbox">Casillas de verificación</option>
                                    <option value="file">Archivo</option>
                                  </select>
                                </div>

                                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                                  <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Opciones (separadas por comas)
                                    </label>
                                    <input
                                      type="text"
                                      value={field.options?.join(', ') || ''}
                                      onChange={(e) => handleFieldChange(index, {
                                        options: e.target.value.split(',').map(opt => opt.trim())
                                      })}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                  </div>
                                )}

                                <div className="col-span-2">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) => handleFieldChange(index, { required: e.target.checked })}
                                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Campo obligatorio</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Guardar formulario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
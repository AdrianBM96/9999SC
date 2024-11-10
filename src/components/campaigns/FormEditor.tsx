import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FormSection, FormField } from '../../types';

interface FormEditorProps {
  sections: FormSection[];
  aiSuggestions?: FormField[];
  onChange: (sections: FormSection[]) => void;
}

export function FormEditor({ sections, aiSuggestions, onChange }: FormEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'Nueva sección',
      fields: []
    };
    onChange([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const addField = (sectionId: string, field?: FormField) => {
    const newField: FormField = field || {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Nuevo campo',
      required: false
    };

    onChange(sections.map(section => 
      section.id === sectionId
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    onChange(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    onChange(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    onChange(sections.filter(section => section.id !== sectionId));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    onChange(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="mr-2">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="flex-1 text-sm font-medium bg-transparent border-none focus:ring-0"
                            placeholder="Título de la sección"
                          />
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="ml-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {section.fields.map((field, fieldIndex) => (
                          <div key={field.id} className="flex items-start space-x-4">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                className="w-full text-sm border-gray-300 rounded-lg"
                                placeholder="Etiqueta del campo"
                              />
                              <div className="flex items-center space-x-4">
                                <select
                                  value={field.type}
                                  onChange={(e) => updateField(section.id, field.id, { type: e.target.value as any })}
                                  className="text-sm border-gray-300 rounded-lg"
                                >
                                  <option value="text">Texto</option>
                                  <option value="textarea">Texto largo</option>
                                  <option value="select">Selección</option>
                                  <option value="radio">Radio</option>
                                  <option value="checkbox">Checkbox</option>
                                </select>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">Requerido</span>
                                </label>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteField(section.id, field.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addField(section.id)}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        >
                          + Añadir campo
                        </button>
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

      <button
        onClick={addSection}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600"
      >
        + Añadir sección
      </button>

      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Sugerencias de IA</h4>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{suggestion.label}</p>
                  <p className="text-xs text-gray-500">Tipo: {suggestion.type}</p>
                </div>
                <button
                  onClick={() => addField(sections[0]?.id, suggestion)}
                  className="ml-4 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


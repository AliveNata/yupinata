import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import type { Section } from '../../../lib/api/content';

interface ContentFormProps {
  initialValues: Partial<Section>;
  onSubmit: (values: Partial<Section>) => void;
  onCancel: () => void;
}

export function ContentForm({
  initialValues,
  onSubmit,
  onCancel
}: ContentFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(field: string, value: string) {
    setValues(prev => {
      if (field.includes('.')) {
        const [parent, child, subfield] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Section] as any),
            [child]: {
              ...(prev[parent as keyof Section] as any)?.[child],
              [subfield]: value
            }
          }
        };
      }
      return { ...prev, [field]: value };
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!values.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!values.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!values.content?.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  }

  // Show profile fields only for who-we-are section
  const showProfileFields = values.name === 'who-we-are';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Section Name"
        value={values.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter section name"
        required
      />
      <Input
        label="Title"
        value={values.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter title"
        required
      />
      <TextArea
        label="Content"
        value={values.content || ''}
        onChange={(e) => handleChange('content', e.target.value)}
        error={errors.content}
        placeholder="Enter content"
        rows={6}
        required
      />

      {showProfileFields && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium">Profile Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nata's Profile */}
            <div className="space-y-4">
              <h4 className="font-medium">Nata Goricx</h4>
              <Input
                label="Birth"
                value={values.profiles?.nata?.birth || ''}
                onChange={(e) => handleChange('profiles.nata.birth', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Profession"
                value={values.profiles?.nata?.profession || ''}
                onChange={(e) => handleChange('profiles.nata.profession', e.target.value)}
                placeholder="Enter profession"
              />
              <Input
                label="Badside"
                value={values.profiles?.nata?.badside || ''}
                onChange={(e) => handleChange('profiles.nata.badside', e.target.value)}
                placeholder="Enter badside"
              />
            </div>

            {/* Yupi's Profile */}
            <div className="space-y-4">
              <h4 className="font-medium">Yupi Coklat</h4>
              <Input
                label="Birth"
                value={values.profiles?.yupi?.birth || ''}
                onChange={(e) => handleChange('profiles.yupi.birth', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Profession"
                value={values.profiles?.yupi?.profession || ''}
                onChange={(e) => handleChange('profiles.yupi.profession', e.target.value)}
                placeholder="Enter profession"
              />
              <Input
                label="Badside"
                value={values.profiles?.yupi?.badside || ''}
                onChange={(e) => handleChange('profiles.yupi.badside', e.target.value)}
                placeholder="Enter badside"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          icon={X}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={Save}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
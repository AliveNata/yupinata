import React, { useState, useEffect } from 'react';
import { GripVertical, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Section {
  id: string;
  name: string;
  title: string;
  content: string;
  display_order: number;
}

export function SectionOrder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load sections');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) return;

    const newSections = [...sections];
    const [movedSection] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, movedSection);

    // Update display order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      display_order: index
    }));

    setSections(updatedSections);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update each section individually to maintain all required fields
      for (const section of sections) {
        const { error } = await supabase
          .from('sections')
          .update({ display_order: section.display_order })
          .eq('id', section.id);

        if (error) throw error;
      }

      toast.success('Section order updated successfully');
    } catch (error) {
      console.error('Error updating section order:', error);
      toast.error('Failed to update section order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Section Order</h2>
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Order'}
        </Button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
          >
            <GripVertical className="text-gray-400" size={20} />
            <span className="font-medium capitalize">{section.name.replace(/-/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
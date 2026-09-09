import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/admin/Layout';
import { ContentForm } from '../../components/admin/content/ContentForm';
import { ContentList } from '../../components/admin/content/ContentList';
import { Button } from '../../components/admin/ui/Button';
import { Plus } from 'lucide-react';
import { type Section, getSections, createSection, updateSection, deleteSection, initializeSections } from '../../lib/api/content';
import { toast } from 'react-hot-toast';

export function Content() {
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        await initializeSections();
        await loadSections();
      } catch (error) {
        console.error('Error initializing sections:', error);
        toast.error('Failed to initialize content sections');
      }
    }
    initialize();
  }, []);

  async function loadSections() {
    try {
      const data = await getSections();
      setSections(data);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load content sections');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(section: Partial<Section>) {
    try {
      if (isCreating) {
        await createSection(section as Omit<Section, 'id'>);
        toast.success('Section created successfully');
      } else if (editingSection) {
        await updateSection(editingSection.id, section);
        toast.success('Section updated successfully');
      }
      await loadSections();
      handleCancel();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    
    try {
      await deleteSection(id);
      toast.success('Section deleted successfully');
      await loadSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  }

  function handleEdit(id: string) {
    const section = sections.find(s => s.id === id);
    if (section) {
      setEditingSection(section);
      setIsCreating(false);
    }
  }

  function handleCancel() {
    setEditingSection(null);
    setIsCreating(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
          {!isCreating && !editingSection && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreating(true)}
            >
              Add Section
            </Button>
          )}
        </div>

        {(isCreating || editingSection) ? (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Create New Section' : 'Edit Section'}
            </h2>
            <ContentForm
              initialValues={editingSection || { name: '', title: '', content: '' }}
              onSubmit={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <ContentList
            sections={sections}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
}
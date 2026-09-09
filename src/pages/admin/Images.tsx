import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/admin/Layout';
import { ImageUploadModal } from '../../components/admin/images/ImageUploadModal';
import { ImageSectionGrid } from '../../components/admin/images/ImageSectionGrid';
import { Button } from '../../components/admin/ui/Button';
import { Upload } from 'lucide-react';
import { type Image, type ImageSection, IMAGE_SECTIONS, getImagesBySection, uploadImage, deleteImage } from '../../lib/api/images';
import { toast } from 'react-hot-toast';

export function Images() {
  const [images, setImages] = useState<Record<ImageSection, Image[]>>({} as Record<ImageSection, Image[]>);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const allImages = await getImagesBySection();
      const imagesBySection = allImages.reduce((acc, img) => {
        if (!acc[img.section as ImageSection]) {
          acc[img.section as ImageSection] = [];
        }
        acc[img.section as ImageSection].push(img);
        return acc;
      }, {} as Record<ImageSection, Image[]>);
      
      setImages(imagesBySection);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File, section: ImageSection, description: string) {
    setIsUploading(true);
    try {
      await uploadImage(file, section, description);
      await loadImages();
      toast.success('Image uploaded successfully');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(id);
      toast.success('Image deleted successfully');
      await loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  }

  // Function to handle opening the modal - forces a re-render of the modal
  const handleOpenModal = () => {
    setIsModalOpen(false); // First close it
    // Use setTimeout to ensure state is updated before reopening
    setTimeout(() => {
      setIsModalOpen(true);
    }, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-8">
            {Object.values(IMAGE_SECTIONS).map((section, index) => (
              <div key={index}>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Image Management</h1>
          <Button
            variant="primary"
            icon={Upload}
            onClick={handleOpenModal}
            disabled={isUploading}
          >
            Upload Image
          </Button>
        </div>

        <div className="space-y-8">
          {(Object.entries(IMAGE_SECTIONS) as [ImageSection, string][]).map(([section, title]) => (
            <ImageSectionGrid
              key={section}
              title={title}
              section={section}
              images={images[section] || []}
              onDelete={handleDelete}
              onUpload={handleOpenModal}
            />
          ))}
        </div>

        <ImageUploadModal
          key={isModalOpen ? 'open' : 'closed'} // Force re-mount of modal when opening
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      </div>
    </Layout>
  );
}
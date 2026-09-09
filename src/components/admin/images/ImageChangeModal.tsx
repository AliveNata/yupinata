import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Image } from '../../../lib/api/images';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ImageChangeModalProps {
  image: Image;
  onClose: () => void;
}

export function ImageChangeModal({ image, onClose }: ImageChangeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload new file
      const filename = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filename);

      // Update image record
      const { error: updateError } = await supabase
        .from('images')
        .update({ path: publicUrl })
        .eq('id', image.id);

      if (updateError) throw updateError;

      toast.success('Image updated successfully');
      onClose();
      window.location.reload(); // Refresh to show new image
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Change Image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {preview ? (
              <div className="relative aspect-video">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                <ImageIcon size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to select a new image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Upload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Image'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { type ImageSection, IMAGE_SECTIONS, SECTION_DESCRIPTIONS } from '../../../lib/api/images';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, section: ImageSection, description: string) => void;
  isUploading: boolean;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading
}: ImageUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [section, setSection] = useState<ImageSection>('gallery');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSection = e.target.value as ImageSection;
    setSection(newSection);
    
    // Set default description based on section
    if (newSection === 'background') {
      setDescription('Who We Are Background');
    } else {
      setDescription('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && section && description) {
      onUpload(file, section, description);
    }
  };

  const sectionDescription = SECTION_DESCRIPTIONS[section as keyof typeof SECTION_DESCRIPTIONS];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Image</h2>
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
                <span className="text-sm text-gray-500">Click to select an image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <Select
              label="Section"
              value={section}
              onChange={handleSectionChange}
              required
            >
              {Object.entries(IMAGE_SECTIONS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>

            {section === 'background' && (
              <Select
                label="Background Type"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              >
                <option value="">Select background type</option>
                <option value="Who We Are Background">Who We Are Background</option>
                <option value="About Background">About Background</option>
                <option value="Music Background">Music Background</option>
              </Select>
            )}
            {section === 'profile' && (
              <Select
                label="Profile Type"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              >
                <option value="">Select profile type</option>
                <option value="Yupi Profile">Yupi Profile</option>
                <option value="Nata Profile">Nata Profile</option>
              </Select>
            )}
            {section !== 'background' && section !== 'profile' && (
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                required
              />
            )}
          </div>

          {sectionDescription && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <div className="whitespace-pre-line">{sectionDescription}</div>
              </div>
            </div>
          )}

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
              disabled={!file || !description || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
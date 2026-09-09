import React from 'react';
import { type Image, SECTION_LIMITS, SECTION_DESCRIPTIONS } from '../../../lib/api/images';
import { ImageCard } from './ImageCard';
import { GalleryGrid } from './GalleryGrid';
import { Button } from '../ui/Button';
import { Upload, Info } from 'lucide-react';

interface ImageSectionGridProps {
  title: string;
  section: string;
  images: Image[];
  onDelete: (id: string) => void;
  onUpload?: () => void;
}

export function ImageSectionGrid({ 
  title, 
  section, 
  images, 
  onDelete,
  onUpload 
}: ImageSectionGridProps) {
  const limit = SECTION_LIMITS[section as keyof typeof SECTION_LIMITS] || Infinity;
  const description = SECTION_DESCRIPTIONS[section as keyof typeof SECTION_DESCRIPTIONS];
  const canUpload = images.length < limit;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {description && (
              <div className="group relative">
                <Info size={16} className="text-gray-400 cursor-help" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 bg-black text-white text-sm p-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {description}
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {images.length} / {limit === Infinity ? '∞' : limit} images
          </p>
        </div>
        {onUpload && (
          <Button
            variant="primary"
            icon={Upload}
            onClick={onUpload}
            disabled={!canUpload}
            title={!canUpload ? `Maximum ${limit} images allowed` : undefined}
          >
            Upload
          </Button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No images in this section</p>
        </div>
      ) : section === 'gallery' ? (
        <GalleryGrid images={images} onDelete={onDelete} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map(image => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={() => onDelete(image.id)}
              showChangeOption={section !== 'favicon'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import type { Image } from '../../../lib/api/images';
import { ImageChangeModal } from './ImageChangeModal';

interface ImageCardProps {
  image: Image;
  onDelete: () => void;
  showChangeOption?: boolean;
}

export function ImageCard({ image, onDelete, showChangeOption = true }: ImageCardProps) {
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback image for broken images
  const fallbackImage = 'https://via.placeholder.com/400x300?text=Image+Not+Found';

  return (
    <>
      <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video relative">
          <img
            src={imageError ? fallbackImage : image.path}
            alt={image.description || 'Uploaded image'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <a
                href={image.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white hover:text-sky transition-colors"
                title="View full size"
              >
                <ExternalLink size={20} />
              </a>
              {showChangeOption && (
                <button
                  onClick={() => setIsChangeModalOpen(true)}
                  className="p-2 text-white hover:text-sky transition-colors"
                  title="Change image"
                >
                  <RefreshCw size={20} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-2 text-white hover:text-pink-accent transition-colors"
                title="Delete image"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm text-gray-600 truncate">{image.description}</p>
          <p className="text-xs text-gray-400 mt-1">Section: {image.section}</p>
        </div>
      </div>

      {isChangeModalOpen && (
        <ImageChangeModal
          image={image}
          onClose={() => setIsChangeModalOpen(false)}
        />
      )}
    </>
  );
}
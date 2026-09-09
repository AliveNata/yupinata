import React from 'react';
import type { Image } from '../../../lib/api/images';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
  images: Image[];
  onDelete: (id: string) => void;
}

export function ImageGrid({ images, onDelete }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No images found. Upload your first image!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={() => onDelete(image.id)}
        />
      ))}
    </div>
  );
}
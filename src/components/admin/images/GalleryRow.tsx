import React from 'react';
import type { Image } from '../../../lib/api/images';
import { ImageCard } from './ImageCard';

interface GalleryRowProps {
  images: Image[];
  onDelete: (id: string) => void;
}

export function GalleryRow({ images, onDelete }: GalleryRowProps) {
  // Always render 4 slots per row
  const slots = Array(4).fill(null);
  images.forEach((image, index) => {
    slots[index] = image;
  });

  return (
    <div className="grid grid-cols-4 gap-4 h-[200px]">
      {slots.map((image, index) => (
        <div key={image?.id || `empty-${index}`} className="h-full">
          {image ? (
            <ImageCard
              image={image}
              onDelete={() => onDelete(image.id)}
            />
          ) : (
            <div className="w-full h-full bg-gray-50 rounded-lg border border-gray-100" />
          )}
        </div>
      ))}
    </div>
  );
}
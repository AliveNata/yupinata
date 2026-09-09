import React, { useState } from 'react';
import { GalleryRow } from './GalleryRow';
import { Pagination } from './Pagination';
import type { Image } from '../../../lib/api/images';

interface GalleryGridProps {
  images: Image[];
  onDelete: (id: string) => void;
}

export function GalleryGrid({ images, onDelete }: GalleryGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 3;
  const IMAGES_PER_ROW = 4;
  const imagesPerPage = ROWS_PER_PAGE * IMAGES_PER_ROW;
  
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);
  
  // Split images into rows
  const rows = Array.from({ length: ROWS_PER_PAGE }, (_, rowIndex) => {
    const rowStart = rowIndex * IMAGES_PER_ROW;
    return currentImages.slice(rowStart, rowStart + IMAGES_PER_ROW);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rows.map((rowImages, index) => (
          <GalleryRow 
            key={index}
            images={rowImages}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
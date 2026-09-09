import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
      <Button
        variant="secondary"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        icon={ChevronLeft}
      >
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
              ${currentPage === pageNum
                ? 'bg-sky text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        icon={ChevronRight}
      >
        Next
      </Button>
    </div>
  );
}
import React from 'react';
import type { Section } from '../../../lib/api/content';
import { ContentCard } from './ContentCard';

interface ContentListProps {
  sections: Section[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ContentList({ sections, onEdit, onDelete }: ContentListProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No content sections found. Add your first section!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <ContentCard
          key={section.id}
          {...section}
          onEdit={() => onEdit(section.id)}
          onDelete={() => onDelete(section.id)}
        />
      ))}
    </div>
  );
}
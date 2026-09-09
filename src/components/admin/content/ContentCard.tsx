import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ContentCardProps {
  id: string;
  name: string;
  title: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ContentCard({
  id,
  name,
  title,
  content,
  onEdit,
  onDelete
}: ContentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-600 mt-1">{title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Edit2}
            onClick={() => onEdit(id)}
            title="Edit section"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => onDelete(id)}
            title="Delete section"
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
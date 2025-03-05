import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskFormProps {
  onSubmit: (title: string) => void;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900/80 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">New Mission</h2>
          <button 
            onClick={onClose}
            className="text-dark-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-400 mb-1">
              Mission Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your next mission?"
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg 
                       text-white placeholder-dark-400 focus:outline-none focus:ring-2 
                       focus:ring-primary-500 focus:border-primary-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       focus:ring-offset-dark-800"
              disabled={!title.trim()}
            >
              Deploy Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
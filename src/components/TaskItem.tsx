import React from 'react';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  due_date?: string;
  tags: string[];
}

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ todo, onToggle, onDelete }) => {
  const priorityColors = {
    LOW: 'bg-blue-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
  };

  const priorityLabels = {
    LOW: 'Side Quest',
    MEDIUM: 'Regular Mission',
    HIGH: 'Critical Mission',
    CRITICAL: 'Boss Battle',
  };

  return (
    <div className={`bg-dark-800 rounded-lg p-4 shadow-lg transition-all duration-200
                    ${todo.completed ? 'opacity-75' : 'hover:transform hover:-translate-y-1'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id, !todo.completed)}
            className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all duration-200
                       ${todo.completed 
                         ? 'bg-primary-500 border-primary-500' 
                         : 'border-dark-400 hover:border-primary-400'}`}
          >
            {todo.completed && (
              <CheckIcon className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1">
            <h3 className={`font-medium transition-all duration-200
                          ${todo.completed 
                            ? 'text-dark-400 line-through' 
                            : 'text-white'}`}>
              {todo.title}
            </h3>
            
            {/* Meta information */}
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Priority Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white
                              ${priorityColors[todo.priority]}`}>
                {priorityLabels[todo.priority]}
              </span>

              {/* Due Date */}
              {todo.due_date && (
                <span className="text-xs text-dark-400">
                  Due: {new Date(todo.due_date).toLocaleDateString()}
                </span>
              )}

              {/* Tags */}
              {todo.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs font-medium
                           bg-dark-700 text-dark-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {todo.description && (
              <p className="mt-2 text-sm text-dark-400">
                {todo.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => onDelete(todo.id)}
          className="text-dark-400 hover:text-red-400 transition-colors duration-200"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}; 
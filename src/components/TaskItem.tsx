import React, { useState } from 'react';
import { TodoItem, SubTask } from '../types/todo';
import {
  TrashIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TaskItemProps {
  todo: TodoItem;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
}

const getPriorityColor = (priority: TodoItem['priority']) => {
  switch (priority) {
    case 'CRITICAL':
      return 'text-red-500';
    case 'HIGH':
      return 'text-orange-500';
    case 'MEDIUM':
      return 'text-yellow-500';
    case 'LOW':
      return 'text-blue-500';
    default:
      return 'text-dark-500';
  }
};

const getPriorityLabel = (priority: TodoItem['priority']) => {
  switch (priority) {
    case 'CRITICAL':
      return 'Critical Mission';
    case 'HIGH':
      return 'Priority Target';
    case 'MEDIUM':
      return 'Standard Mission';
    case 'LOW':
      return 'Side Quest';
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onToggleSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="todo-item group">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggle(todo.id, todo.completed)}
            className={`todo-checkbox ${
              todo.completed ? 'bg-primary-500 border-primary-500' : 'border-dark-200'
            }`}
          >
            {todo.completed && <CheckIcon className="w-4 h-4 text-white" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`todo-text ${todo.completed ? 'todo-text-completed' : ''}`}>
                {todo.title}
              </span>
              {todo.due_date && (
                <span className="text-sm text-dark-500 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {format(new Date(todo.due_date), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
            
            {(todo.tags.length > 0 || todo.priority || todo.description || todo.subtasks.length > 0) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-600 mt-1"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
                {isExpanded ? 'Less' : 'More'} details
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 ml-10 space-y-3">
            {todo.description && (
              <p className="text-sm text-dark-600">{todo.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {todo.priority && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md 
                                bg-opacity-10 text-sm ${getPriorityColor(todo.priority)}`}>
                  {getPriorityLabel(todo.priority)}
                </span>
              )}
              
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md 
                           bg-primary-100 text-primary-700 text-sm"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {todo.subtasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-dark-700">Mission Objectives</h4>
                {todo.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSubtask(todo.id, subtask.id, subtask.completed)}
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center
                                transition-colors duration-200 ${
                                  subtask.completed
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-dark-200'
                                }`}
                    >
                      {subtask.completed && <CheckIcon className="w-3 h-3 text-white" />}
                    </button>
                    <span
                      className={`text-sm ${
                        subtask.completed ? 'line-through text-dark-400' : 'text-dark-600'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                 text-dark-400 hover:text-red-500"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}; 
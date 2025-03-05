import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Priority, RecurrencePattern, TodoItem } from '../types/todo';

interface TaskFormProps {
  onSubmit: (task: Partial<TodoItem>) => Promise<void>;
  initialValues?: Partial<TodoItem>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialValues }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialValues?.due_date || '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isRecurring, setIsRecurring] = useState(initialValues?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | undefined>(
    initialValues?.recurrence_pattern
  );
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const task: Partial<TodoItem> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      tags,
      due_date: dueDate || undefined,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      subtasks: subtasks.map((title) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      })),
    };

    await onSubmit(task);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate('');
    setTags([]);
    setNewTag('');
    setIsRecurring(false);
    setRecurrencePattern(undefined);
    setSubtasks([]);
    setIsExpanded(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addSubtask = (subtask: string) => {
    if (subtask.trim()) {
      setSubtasks([...subtasks, subtask.trim()]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your next mission..."
          className="input"
        />
        <button type="submit" className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          <span>Deploy</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-dark-500 hover:text-dark-700"
      >
        {isExpanded ? 'Hide' : 'Show'} advanced options
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Mission Brief
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add mission details..."
              className="input min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="input"
              >
                <option value="LOW">Side Quest</option>
                <option value="MEDIUM">Standard Mission</option>
                <option value="HIGH">Priority Target</option>
                <option value="CRITICAL">Critical Mission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Mission Deadline
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Mission Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-100 text-primary-700 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="input"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Recurring Mission
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-600">Repeat mission</span>
              </label>
              {isRecurring && (
                <select
                  value={recurrencePattern}
                  onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                  className="input"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Mission Objectives
            </label>
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-dark-700">{subtask}</span>
                  <button
                    type="button"
                    onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                    className="text-dark-400 hover:text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add objective..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubtask(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="input"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addSubtask(input.value);
                    input.value = '';
                  }}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}; 
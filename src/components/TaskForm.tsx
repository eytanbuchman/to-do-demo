import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
}

interface TaskType {
  id?: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  is_recurring: boolean;
  recurrence_pattern?: string;
  categories: string[];
  user_id?: string;
  created_at?: string;
}

interface TaskFormProps {
  onSubmit: (task: Partial<TaskType>) => void
  onCancel: () => void
  initialData?: Partial<TaskType> | null
  availableCategories: Category[]
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData, availableCategories }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false)
  const [recurrencePattern, setRecurrencePattern] = useState(initialData?.recurrence_pattern || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    // Handle ISO string format
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    // Handle yyyy-MM-dd format
    return dateString;
  };

  const formatDateForSubmission = (dateString: string) => {
    if (!dateString) return null;
    // Ensure the date is in ISO format for the database
    return new Date(dateString).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Submitting form with data:', { title, description, due_date: dueDate, priority, tags, is_recurring: isRecurring, recurrence_pattern: recurrencePattern, categories: selectedCategories });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Format the date for submission
      const formattedDate = dueDate ? formatDateForSubmission(dueDate) : null;
      console.log('Formatted date:', formattedDate);

      const taskData: Partial<TaskType> = {
        title,
        description,
        due_date: formattedDate,
        priority,
        tags,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
        categories: selectedCategories,
        user_id: user.id
      };

      if (initialData?.id) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Task updated');
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        toast.success('Task created');
      }

      onSubmit(taskData);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setTags([]);
      setIsRecurring(false);
      setRecurrencePattern('');
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                   focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                   focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={dueDate ? formatDateForInput(dueDate) : ''}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                     focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Squad Assignment
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              multiple
              value={selectedCategories}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions).map(option => option.value)
                setSelectedCategories(options)
              }}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            >
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Create new squad (hit Enter)..."
              className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent text-sm"
              onKeyPress={async (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const categoryName = input.value.trim();
                  if (categoryName) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) throw new Error('No user found');

                      const { data, error } = await supabase
                        .from('categories')
                        .insert([{
                          name: categoryName,
                          user_id: user.id,
                          color: '#' + Math.floor(Math.random()*16777215).toString(16)
                        }])
                        .select();

                      if (error) throw error;
                      if (data) {
                        availableCategories.push(data[0]);
                        setSelectedCategories([...selectedCategories, data[0].id]);
                        input.value = '';
                        toast.success('Squad created and assigned');
                      }
                    } catch (error) {
                      console.error('Error adding category:', error);
                      toast.error('Failed to create squad');
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="form-checkbox h-4 w-4 text-rebel-red border-dark-700 rounded 
                     focus:ring-rebel-red focus:ring-offset-dark-900"
          />
          <span className="text-sm font-medium text-gray-300">Recurring Task</span>
        </label>

        {isRecurring && (
          <input
            type="text"
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value)}
            className="mt-2 w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                     focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            placeholder="e.g., daily, weekly, monthly"
          />
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-dark-700 rounded-lg text-gray-400 
                   hover:text-white hover:border-rebel-red transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm 
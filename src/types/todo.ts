export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  priority: Priority;
  tags: string[];
  subtasks: SubTask[];
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end_date?: string;
  parent_template_id?: string;
}

export interface TodoTemplate {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  subtasks: Omit<SubTask, 'id'>[];
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
} 
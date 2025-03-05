-- Enhance the todos table with new fields
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES todos(id);

-- Create an index for faster queries on common fields
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date) WHERE due_date IS NOT NULL;

-- Create a function to handle recurring todos
CREATE OR REPLACE FUNCTION handle_recurring_todos() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed AND NEW.is_recurring THEN
    -- Create the next occurrence
    INSERT INTO todos (
      title,
      description,
      user_id,
      priority,
      tags,
      subtasks,
      is_recurring,
      recurrence_pattern,
      parent_template_id,
      due_date
    )
    VALUES (
      NEW.title,
      NEW.description,
      NEW.user_id,
      NEW.priority,
      NEW.tags,
      NEW.subtasks,
      NEW.is_recurring,
      NEW.recurrence_pattern,
      NEW.id,
      CASE NEW.recurrence_pattern
        WHEN 'DAILY' THEN NEW.due_date + INTERVAL '1 day'
        WHEN 'WEEKLY' THEN NEW.due_date + INTERVAL '1 week'
        WHEN 'MONTHLY' THEN NEW.due_date + INTERVAL '1 month'
        ELSE NULL
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for recurring todos
DROP TRIGGER IF EXISTS trigger_recurring_todos ON todos;
CREATE TRIGGER trigger_recurring_todos
  AFTER UPDATE ON todos
  FOR EACH ROW
  WHEN (NEW.completed IS DISTINCT FROM OLD.completed)
  EXECUTE FUNCTION handle_recurring_todos(); 
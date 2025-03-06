-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#666666',
    user_id UUID NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create a junction table for task-category relationships
CREATE TABLE IF NOT EXISTS task_categories (
    task_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, category_id)
);

-- Add RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
ON categories
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for task_categories
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task categories"
ON task_categories
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM todos t
        WHERE t.id = task_id
        AND t.user_id = auth.uid()
    )
); 
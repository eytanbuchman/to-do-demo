# TaskRebel Project Rules

## Database Structure

### Tables

1. `todos` Table
```sql
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[] DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  due_date TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
  recurrence_end_date TIMESTAMP WITH TIME ZONE
);
```

2. `categories` Table
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#666666',
  user_id TEXT NOT NULL
);
```

3. `task_categories` Junction Table
```sql
CREATE TABLE task_categories (
  task_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, category_id)
);
```

4. `profiles` Table
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  website TEXT,
  avatar_url TEXT
);
```

### Important Column Names
- Use `task_id` (not `todo_id`) in relationships
- Use `user_id` for ownership
- Use lowercase for priority values: 'low', 'medium', 'high'

## Deployment Workflow

1. **Making Changes**
   - Edit code locally
   - Test with `npm run dev -- --port 3001` (port 3000 is typically in use)
   - Commit changes with semantic commit messages:
     ```bash
     git add .
     git commit -m "type: description"
     git push
     ```
   - Types: feat, fix, docs, style, refactor, test, chore

2. **Automatic Deployment**
   - Push to main branch triggers Netlify deployment
   - Environment variables are set in Netlify dashboard
   - Supabase connection details in `.env`:
     ```
     VITE_SUPABASE_URL=https://lyxwddjsdpubbdhwkbtd.supabase.co
     VITE_SUPABASE_ANON_KEY=[your-key]
     ```

3. **Database Changes**
   - Always check existing structure before modifications
   - Use SQL queries to inspect:
     ```sql
     -- Check table structure
     SELECT column_name, data_type, column_default, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = '[table_name]';

     -- Check existing policies
     SELECT * FROM pg_policies WHERE schemaname = 'public';
     ```

## Common Issues & Solutions

1. **Analytics Queries**
   - Use `task_categories` (not `todo_categories`)
   - Join with proper column names: `task_id`, not `todo_id`

2. **Task Filters**
   - Category filters need subqueries on `task_categories`
   - Priority values are lowercase: 'low', 'medium', 'high'

3. **Auth Flow**
   - Password reset uses `type=recovery` in URL
   - Profile creation trigger runs on new user signup 
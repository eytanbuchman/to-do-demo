# TaskRebel

The anti-todo list for rebels who get shit done. A modern, edgy task management app built with React, TypeScript, Supabase, and Netlify Identity.

## 🚀 Features

- 🎯 Transform tasks into missions
- 🏷️ Custom tags and categories
- ⚡ Priority levels (from Side Quest to Critical Mission)
- 📝 Subtasks as mission objectives
- 🔄 Recurring missions
- ⏰ Flexible deadlines
- 🔐 User authentication
- 💾 Real-time data sync

## 🛠️ Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: TailwindCSS
- Database: Supabase
- Authentication: Netlify Identity
- Hosting: Netlify

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Supabase account
- A Netlify account

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/eytanbuchman/to-do-demo.git
   cd to-do-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new Supabase project

2. Run the following SQL in Supabase's SQL editor:
   ```sql
   -- Enhance the todos table with new fields
   CREATE TABLE todos (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id TEXT NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
     tags TEXT[] DEFAULT '{}',
     subtasks JSONB DEFAULT '[]',
     due_date TIMESTAMP WITH TIME ZONE,
     is_recurring BOOLEAN DEFAULT FALSE,
     recurrence_pattern TEXT CHECK (recurrence_pattern IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
     recurrence_end_date TIMESTAMP WITH TIME ZONE,
     parent_template_id UUID REFERENCES todos(id)
   );

   -- Create indexes
   CREATE INDEX idx_todos_user_completed ON todos(user_id, completed);
   CREATE INDEX idx_todos_due_date ON todos(due_date) WHERE due_date IS NOT NULL;

   -- Set up row level security
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can only access their own todos"
     ON todos
     FOR ALL
     USING (auth.uid()::text = user_id);
   ```

### Netlify Deployment

1. Connect your repository to Netlify

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Set up environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Enable Netlify Identity:
   - Go to Site settings > Identity
   - Enable Identity
   - Configure registration preferences
   - Set up external providers (optional)

## 📝 Development Notes

### File Structure
```
src/
├── components/        # React components
├── contexts/         # Context providers
├── types/           # TypeScript types
└── config/          # Configuration files
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License

MIT License - feel free to rebel against this too.

## 🙏 Acknowledgments

Built by rebels, for rebels. No productivity experts were consulted in the making of this app.

## Database Structure

### Tables

#### 1. `todos` Table
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium',
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    subtasks JSONB[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `categories` Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `task_categories` Table (Junction Table)
```sql
CREATE TABLE task_categories (
    task_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, category_id)
);
```

#### 4. `profiles` Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    timezone TEXT DEFAULT 'UTC',
    theme TEXT DEFAULT 'dark',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
interface Todo {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    completed: boolean;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    is_recurring: boolean;
    recurrence_pattern?: string;
    subtasks: any[];
    created_at: string;
    updated_at: string;
    categories?: Category[];
}

interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    website: string;
    timezone: string;
    theme: 'dark' | 'light';
    notification_preferences: {
        email: boolean;
        push: boolean;
    };
}
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

1. Users can only view their own data
2. Users can only insert their own data
3. Users can only update their own data
4. Users can only delete their own data

### Analytics Views

The application uses views instead of separate tables for analytics:

1. `task_completion_stats` - Task completion statistics by user
2. `category_usage_stats` - Category usage statistics
3. `user_activity_stats` - User activity statistics over time

## Features

- User authentication and profile management
- Task creation and management with categories
- Task filtering and sorting
- Recurring tasks support
- Category management
- Analytics and reporting
- Dark/Light theme support
- Notification preferences
- Timezone support

## Tech Stack

- Frontend: React + TypeScript + Vite
- UI: TailwindCSS
- Backend: Supabase
- Database: PostgreSQL
- Authentication: Supabase Auth

## Development

To start the development server:

```bash
npm run dev
```

Note: The application runs on port 3001 by default.

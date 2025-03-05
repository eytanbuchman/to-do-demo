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

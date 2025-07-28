# DevOps Command Center (Next.js)

Welcome to the DevOps Command Center! This is a web application designed to be a quick and powerful reference for common DevOps, IT, and development commands. Users can browse commands by category, add their own, and even use AI to generate command descriptions.

This project is built with Next.js, providing a robust, full-stack framework with a focus on performance and developer experience.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.io/)
- **Styling**: CSS with Custom Properties (Variables) for easy theming.
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) for generating command descriptions.

## Project Structure

The project follows the standard Next.js App Router structure, which cleanly separates frontend and backend concerns within a single codebase.

```
/
├── app/
│   ├── (main)/             # Route group for the main application UI
│   │   ├── page.tsx        # Main application page component
│   │   └── layout.tsx      # Layout specific to the main app (header, sidebar)
│   ├── auth/               # Route group for authentication pages
│   │   ├── signin/page.tsx # Sign In page
│   │   ├── signup/page.tsx # Sign Up page
│   │   └── layout.tsx      # Shared layout for all auth pages
│   ├── api/                # The Backend
│   │   ├── commands/route.ts       # API endpoint for command data
│   │   └── generate-description/   # API endpoint for AI integration
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout for the entire application
├── components/             # The Frontend Building Blocks
│   ├── CommandClient.tsx   # Main interactive client component
│   └── AuthForm.tsx        # Reusable form for sign-in/sign-up
├── lib/                    # Shared code, types, and static data
│   ├── data.ts             # Initial static command data
│   ├── types.ts            # TypeScript type definitions
│   └── supabaseClient.ts   # Supabase client initialization
├── public/                 # Static assets (images, icons)
├── package.json            # Project dependencies and scripts
└── next.config.mjs         # Next.js configuration
```

### Frontend (`app/(main)`, `app/auth`, `components/`)

- The user interface is built with **React Server Components** and **Client Components**, a core feature of the Next.js App Router.
- **`app/(main)` and `app/auth`** contain the different pages of the application, organized into route groups for clarity. Each group can have its own specific layout.
- **`components/`** holds all the reusable UI elements, like command cards, modals, and forms. This is the heart of the frontend UI. `CommandClient.tsx` is the primary interactive component that manages the state for the main command center.

### Backend (`app/api/`)

- The backend logic is handled by **Next.js API Routes** located in the `app/api/` directory.
- These are server-side endpoints that the frontend can call. This is where you would handle database operations, external API calls, and other secure logic.
- For example, `app/api/generate-description/route.ts` securely calls the Google Gemini API with a secret key, ensuring the key is never exposed to the client's browser.

## Getting Started

To run the project locally, you need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Supabase:**
    This project uses Supabase as its database and for authentication.
    - Go to [supabase.com](https://supabase.com/), create a free account, and start a new project.
    - Once your project is created, navigate to **Project Settings** > **API**.
    - You will find your **Project URL** and your `anon` **public key**. You will need these for the next step.

3.  **Environment Variables:**
    Create a file named `.env.local` in the project root. Add your Supabase credentials and your Google Gemini API key.

    ```
    # Google Gemini API Key
    API_KEY=your_google_gemini_api_key

    # Supabase Configuration
    # Found in your Supabase project's API settings page
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
    ```
    > **Note:** The `NEXT_PUBLIC_` prefix is essential. It allows Next.js to expose these variables to the browser, which is required for the Supabase client-side library to work.

4.  **Set up Database Schema:**
    Navigate to the **SQL Editor** in your Supabase project dashboard and run the following SQL queries. This will create the necessary tables and security policies.

    ```sql
    -- 1. Create the 'categories' table
    create table public.categories (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade not null,
      name text not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      -- A user cannot have two categories with the same name
      unique(user_id, name)
    );

    -- 2. Create the 'commands' table
    create table public.commands (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade not null,
      category_id uuid references public.categories(id) on delete cascade not null,
      description text not null,
      command text not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      -- A command string should be unique within a category for a user
      unique(user_id, category_id, command)
    );

    -- 3. Set up Row Level Security (RLS) for categories
    alter table public.categories enable row level security;

    create policy "Users can CRUD their own categories."
      on public.categories for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    -- 4. Set up RLS for commands
    alter table public.commands enable row level security;

    create policy "Users can CRUD their own commands."
      on public.commands for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).
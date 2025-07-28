// Matches the Supabase schema
export interface Command {
  id: string; // uuid
  description: string;
  command: string;
  user_id: string; // uuid
  category_id: string; // uuid
  created_at?: string; // timestamp
}

export interface Category {
  id: string; // uuid
  name: string;
  user_id: string; // uuid
  created_at?: string; // timestamp
  commands: Command[]; // This will be joined in the query
}


// For client-side display when searching across all categories
export interface CommandWithCategory extends Command {
  categoryName: string;
}

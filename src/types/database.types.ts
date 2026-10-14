// Placeholder for the generated Supabase schema types. Once the project has
// tables, overwrite this file with the real thing (see "Supabase" in README.md):
//
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Fichier generé par Supabase CLI. Regénérer avec: npm run generate:schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: "USER" | "ADMIN";
          active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: "USER" | "ADMIN";
          active?: boolean;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: "USER" | "ADMIN";
          active?: boolean;
          deleted_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      feature_flags: {
        Row: {
          id: string;
          key: string;
          enabled: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          enabled?: boolean;
          description?: string | null;
          updated_by?: string | null;
        };
        Update: {
          enabled?: boolean;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "USER" | "ADMIN";
    };
    CompositeTypes: Record<string, never>;
  };
}
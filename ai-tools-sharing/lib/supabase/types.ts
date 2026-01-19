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
          username: string | null;
          fullname: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          fullname?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          fullname?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_tools: {
        Row: {
          id: string;
          user_id: string;
          tool_name: string;
          use_case: string;
          rating: number | null;
          hashtags: string[];
          date_uploaded: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_name: string;
          use_case: string;
          rating?: number | null;
          hashtags?: string[];
          date_uploaded?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_name?: string;
          use_case?: string;
          rating?: number | null;
          hashtags?: string[];
          date_uploaded?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

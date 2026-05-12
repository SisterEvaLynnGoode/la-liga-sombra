export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnitStatus = "locked" | "available" | "in_progress" | "completed";
export type ActivityType = "vocab_match" | "dialogue" | "listening" | "grammar" | "cultural";
export type BadgeType = "case_solved" | "perfect_score" | "speed_run" | "cultural_expert" | "first_case";

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          display_name: string;
          class_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          class_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          class_code?: string;
          created_at?: string;
        };
      };
      units: {
        Row: {
          id: string;
          number: number;
          country: string;
          title_es: string;
          title_en: string;
          description: string;
        };
        Insert: {
          id?: string;
          number: number;
          country: string;
          title_es: string;
          title_en: string;
          description: string;
        };
        Update: {
          id?: string;
          number?: number;
          country?: string;
          title_es?: string;
          title_en?: string;
          description?: string;
        };
      };
      attempts: {
        Row: {
          id: string;
          student_id: string;
          unit_id: string;
          activity_type: ActivityType;
          score: number;
          max_score: number;
          time_spent_seconds: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          unit_id: string;
          activity_type: ActivityType;
          score: number;
          max_score: number;
          time_spent_seconds: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          unit_id?: string;
          activity_type?: ActivityType;
          score?: number;
          max_score?: number;
          time_spent_seconds?: number;
          completed_at?: string;
        };
      };
      mastery: {
        Row: {
          id: string;
          student_id: string;
          vocab_term: string;
          attempts: number;
          correct: number;
          last_seen: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          vocab_term: string;
          attempts?: number;
          correct?: number;
          last_seen?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          vocab_term?: string;
          attempts?: number;
          correct?: number;
          last_seen?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          student_id: string;
          badge_type: BadgeType;
          unit_id: string | null;
          earned_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_type: BadgeType;
          unit_id?: string | null;
          earned_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          badge_type?: BadgeType;
          unit_id?: string | null;
          earned_at?: string;
        };
      };
      unit_progress: {
        Row: {
          id: string;
          student_id: string;
          unit_id: string;
          status: UnitStatus;
          case_solved: boolean;
          criminal_caught: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          unit_id: string;
          status?: UnitStatus;
          case_solved?: boolean;
          criminal_caught?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          unit_id?: string;
          status?: UnitStatus;
          case_solved?: boolean;
          criminal_caught?: boolean;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      unit_status: UnitStatus;
      activity_type: ActivityType;
      badge_type: BadgeType;
    };
  };
}

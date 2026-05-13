export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnitStatus = "locked" | "available" | "in_progress" | "completed";
export type ActivityType = "vocab_match" | "dialogue" | "listening" | "grammar" | "cultural" | "lineup";
export type BadgeType = "case_solved" | "perfect_score" | "speed_run" | "cultural_expert" | "first_case";

// Supabase v2 requires Relationships and CompositeTypes for correct type inference
export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          class_code: string;
          teacher_name: string;
          period_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_code: string;
          teacher_name: string;
          period_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_code?: string;
          teacher_name?: string;
          period_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          display_name: string;
          class_id: string | null;
          class_code: string;
          pin_hash: string | null;
          pin_salt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          class_id?: string | null;
          class_code: string;
          pin_hash?: string | null;
          pin_salt?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          class_id?: string | null;
          class_code?: string;
          pin_hash?: string | null;
          pin_salt?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "attempts_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "mastery_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "badges_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "badges_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          }
        ];
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
          stage_index: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          unit_id: string;
          status?: UnitStatus;
          case_solved?: boolean;
          criminal_caught?: boolean;
          completed_at?: string | null;
          stage_index?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          unit_id?: string;
          status?: UnitStatus;
          case_solved?: boolean;
          criminal_caught?: boolean;
          completed_at?: string | null;
          stage_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "unit_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_progress_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      unit_status: UnitStatus;
      activity_type: ActivityType;
      badge_type: BadgeType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnitStatus = "locked" | "available" | "in_progress" | "completed";
export type ActivityType =
  | "vocab_match" | "dialogue" | "listening" | "grammar" | "cultural" | "lineup"
  | "academia_recognition" | "academia_memorization" | "academia_production" | "academia_application"
  | "stakeout"
  | "training_vocab" | "training_grammar" | "training_drill";
export type BadgeType =
  | "case_solved" | "perfect_score" | "speed_run" | "cultural_expert" | "first_case"
  | "unit_completed" | "speed_demon" | "vocab_master" | "streak_3" | "streak_7"
  | "distinguished_recruit" | "vigilancia_exitosa"
  | "entrenamiento_diario" | "maestro_vocabulario" | "poliglota";

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
      class_alerts: {
        Row: { id: string; class_id: string; message: string; sent_at: string };
        Insert: { id?: string; class_id: string; message: string; sent_at?: string };
        Update: { id?: string; class_id?: string; message?: string; sent_at?: string };
        Relationships: [{ foreignKeyName: "class_alerts_class_id_fkey"; columns: ["class_id"]; isOneToOne: false; referencedRelation: "classes"; referencedColumns: ["id"] }];
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
      academia_sessions: {
        Row: {
          id: string;
          student_id: string;
          unit_id: string;
          routing_tier: "ready" | "recommended" | "required";
          retry_count: number;
          passed_first_try: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          unit_id: string;
          routing_tier: "ready" | "recommended" | "required";
          retry_count?: number;
          passed_first_try?: boolean;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          unit_id?: string;
          routing_tier?: "ready" | "recommended" | "required";
          retry_count?: number;
          passed_first_try?: boolean;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academia_sessions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academia_sessions_unit_id_fkey";
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

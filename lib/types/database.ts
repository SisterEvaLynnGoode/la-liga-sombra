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
  | "training_vocab" | "training_grammar" | "training_drill"
  | "daily_briefing";
export type BadgeType =
  | "case_solved" | "perfect_score" | "speed_run" | "cultural_expert" | "first_case"
  | "unit_completed" | "speed_demon" | "vocab_master" | "streak_3" | "streak_7"
  | "distinguished_recruit" | "vigilancia_exitosa"
  | "entrenamiento_diario" | "maestro_vocabulario" | "poliglota"
  | "informe_completo" | "estudiante_disciplinado" | "agente_elite"
  | "detective_frio"
  | "operacion_eclipse_completada"
  | "diplomatico" | "cazador_implacable" | "maestro_negociador_boss"
  | "agente_elite_boss" | "agente_estandar" | "agente_cuidadoso";

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
      boss_progress: {
        Row: {
          id: string;
          primary_student_id: string;
          partner_student_id: string | null;
          boss_id: string;
          difficulty: "easy" | "normal" | "hard" | null;
          current_stage: number;
          stage_data: Record<string, unknown>;
          ethical_choices: Array<{ stage: number; choice: string; sentence?: string }>;
          partner_name: string | null;
          started_at: string;
          last_saved_at: string;
          completed_at: string | null;
          skipped_at: string | null;
          final_score: number | null;
          final_ending: string | null;
        };
        Insert: {
          id?: string;
          primary_student_id: string;
          partner_student_id?: string | null;
          boss_id: string;
          difficulty?: "easy" | "normal" | "hard" | null;
          current_stage?: number;
          stage_data?: Record<string, unknown>;
          ethical_choices?: Array<{ stage: number; choice: string; sentence?: string }>;
          partner_name?: string | null;
          started_at?: string;
          last_saved_at?: string;
          completed_at?: string | null;
          skipped_at?: string | null;
          final_score?: number | null;
          final_ending?: string | null;
        };
        Update: {
          id?: string;
          primary_student_id?: string;
          partner_student_id?: string | null;
          boss_id?: string;
          difficulty?: "easy" | "normal" | "hard" | null;
          current_stage?: number;
          stage_data?: Record<string, unknown>;
          ethical_choices?: Array<{ stage: number; choice: string; sentence?: string }>;
          partner_name?: string | null;
          started_at?: string;
          last_saved_at?: string;
          completed_at?: string | null;
          skipped_at?: string | null;
          final_score?: number | null;
          final_ending?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "boss_progress_primary_student_id_fkey";
            columns: ["primary_student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_briefings: {
        Row: {
          id: string;
          student_id: string;
          briefing_date: string;  // ISO date string YYYY-MM-DD
          terms_shown: string[];
          terms_correct: number;
          completed: boolean;
          skipped: boolean;
          time_spent_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          briefing_date: string;
          terms_shown: string[];
          terms_correct?: number;
          completed?: boolean;
          skipped?: boolean;
          time_spent_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          briefing_date?: string;
          terms_shown?: string[];
          terms_correct?: number;
          completed?: boolean;
          skipped?: boolean;
          time_spent_seconds?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_briefings_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
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
          advanced_without_passing: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          unit_id: string;
          routing_tier: "ready" | "recommended" | "required";
          retry_count?: number;
          passed_first_try?: boolean;
          advanced_without_passing?: boolean;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          unit_id?: string;
          routing_tier?: "ready" | "recommended" | "required";
          retry_count?: number;
          passed_first_try?: boolean;
          advanced_without_passing?: boolean;
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
          cold_case_completed_at: string | null;
          cold_case_score: number | null;
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
          cold_case_completed_at?: string | null;
          cold_case_score?: number | null;
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
          cold_case_completed_at?: string | null;
          cold_case_score?: number | null;
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

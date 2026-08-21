export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          accion: string
          actor_id: string | null
          created_at: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id: number
          registro_id: string | null
          tabla: string
        }
        Insert: {
          accion: string
          actor_id?: string | null
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: never
          registro_id?: string | null
          tabla: string
        }
        Update: {
          accion?: string
          actor_id?: string | null
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: never
          registro_id?: string | null
          tabla?: string
        }
        Relationships: []
      }
      calificaciones: {
        Row: {
          calificado_por: string
          comentario: string | null
          created_at: string
          entrega_id: string
          id: string
          nota: number
          updated_at: string
        }
        Insert: {
          calificado_por: string
          comentario?: string | null
          created_at?: string
          entrega_id: string
          id?: string
          nota: number
          updated_at?: string
        }
        Update: {
          calificado_por?: string
          comentario?: string | null
          created_at?: string
          entrega_id?: string
          id?: string
          nota?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_calificado_por_fkey"
            columns: ["calificado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: true
            referencedRelation: "entregas"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          archivo_nombre: string
          archivo_path: string
          entregada_at: string
          estudiante_id: string
          id: string
          tarea_id: string
          updated_at: string
        }
        Insert: {
          archivo_nombre: string
          archivo_path: string
          entregada_at?: string
          estudiante_id: string
          id?: string
          tarea_id: string
          updated_at?: string
        }
        Update: {
          archivo_nombre?: string
          archivo_path?: string
          entregada_at?: string
          estudiante_id?: string
          id?: string
          tarea_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          created_at: string
          estudiante_id: string
          materia_id: string
        }
        Insert: {
          created_at?: string
          estudiante_id: string
          materia_id: string
        }
        Update: {
          created_at?: string
          estudiante_id?: string
          materia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          profesor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          profesor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          profesor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nombre_completo: string
          rol: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tareas: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha_limite: string
          id: string
          materia_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha_limite: string
          id?: string
          materia_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha_limite?: string
          id?: string
          materia_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      health_check: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "profesor" | "estudiante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "profesor", "estudiante"],
    },
  },
} as const

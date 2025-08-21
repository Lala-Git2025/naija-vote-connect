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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio_source: string | null
          constituency: string | null
          created_at: string | null
          education: string | null
          election_date: string | null
          experience: string | null
          external_id_inec: string | null
          id: string
          inec_candidate_id: string | null
          manifesto: string | null
          name: string
          normalized_name: string | null
          occupation: string | null
          office: string | null
          party: string
          party_code: string | null
          pending_verification: boolean | null
          race_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio_source?: string | null
          constituency?: string | null
          created_at?: string | null
          education?: string | null
          election_date?: string | null
          experience?: string | null
          external_id_inec?: string | null
          id?: string
          inec_candidate_id?: string | null
          manifesto?: string | null
          name: string
          normalized_name?: string | null
          occupation?: string | null
          office?: string | null
          party: string
          party_code?: string | null
          pending_verification?: boolean | null
          race_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio_source?: string | null
          constituency?: string | null
          created_at?: string | null
          education?: string | null
          election_date?: string | null
          experience?: string | null
          external_id_inec?: string | null
          id?: string
          inec_candidate_id?: string | null
          manifesto?: string | null
          name?: string
          normalized_name?: string | null
          occupation?: string | null
          office?: string | null
          party?: string
          party_code?: string | null
          pending_verification?: boolean | null
          race_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_party_code_fkey"
            columns: ["party_code"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "candidates_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          created_at: string | null
          deadline_date: string
          description: string | null
          election_id: string | null
          id: string
          priority: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline_date: string
          description?: string | null
          election_id?: string | null
          id?: string
          priority?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline_date?: string
          description?: string | null
          election_id?: string | null
          id?: string
          priority?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          created_at: string | null
          description: string | null
          election_date: string
          id: string
          name: string
          states: string[] | null
          status: Database["public"]["Enums"]["election_status"]
          type: Database["public"]["Enums"]["election_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          election_date: string
          id?: string
          name: string
          states?: string[] | null
          status?: Database["public"]["Enums"]["election_status"]
          type: Database["public"]["Enums"]["election_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          election_date?: string
          id?: string
          name?: string
          states?: string[] | null
          status?: Database["public"]["Enums"]["election_status"]
          type?: Database["public"]["Enums"]["election_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      fact_checks: {
        Row: {
          candidate_id: string | null
          claim: string
          confidence_score: number | null
          created_at: string | null
          explanation: string | null
          id: string
          published_at: string | null
          rating: string | null
          source_name: string
          source_url: string | null
          subjects: Json | null
          topic: string | null
          updated_at: string | null
          verdict: string
        }
        Insert: {
          candidate_id?: string | null
          claim: string
          confidence_score?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          published_at?: string | null
          rating?: string | null
          source_name: string
          source_url?: string | null
          subjects?: Json | null
          topic?: string | null
          updated_at?: string | null
          verdict: string
        }
        Update: {
          candidate_id?: string | null
          claim?: string
          confidence_score?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          published_at?: string | null
          rating?: string | null
          source_name?: string
          source_url?: string | null
          subjects?: Json | null
          topic?: string | null
          updated_at?: string | null
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_checks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      manifestos: {
        Row: {
          candidate_id: string | null
          checksum: string | null
          created_at: string
          embedding: string | null
          id: string
          party_code: string | null
          published_at: string | null
          raw_text: string | null
          sections: Json | null
          source: string
          source_url: string | null
          updated_at: string
          version_label: string | null
        }
        Insert: {
          candidate_id?: string | null
          checksum?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          party_code?: string | null
          published_at?: string | null
          raw_text?: string | null
          sections?: Json | null
          source: string
          source_url?: string | null
          updated_at?: string
          version_label?: string | null
        }
        Update: {
          candidate_id?: string | null
          checksum?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          party_code?: string | null
          published_at?: string | null
          raw_text?: string | null
          sections?: Json | null
          source?: string
          source_url?: string | null
          updated_at?: string
          version_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manifestos_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifestos_party_code_fkey"
            columns: ["party_code"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["code"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          published_at: string | null
          source_name: string
          source_url: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          published_at?: string | null
          source_name: string
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          published_at?: string | null
          source_name?: string
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parties: {
        Row: {
          code: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      polling_units: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: string
          inec_pu_id: string | null
          latitude: number | null
          lga: string
          longitude: number | null
          name: string
          registered_voters: number | null
          state: string
          updated_at: string | null
          ward: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          inec_pu_id?: string | null
          latitude?: number | null
          lga: string
          longitude?: number | null
          name: string
          registered_voters?: number | null
          state: string
          updated_at?: string | null
          ward: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          inec_pu_id?: string | null
          latitude?: number | null
          lga?: string
          longitude?: number | null
          name?: string
          registered_voters?: number | null
          state?: string
          updated_at?: string | null
          ward?: string
        }
        Relationships: []
      }
      races: {
        Row: {
          constituency: string | null
          created_at: string | null
          description: string | null
          election_id: string | null
          id: string
          lga: string | null
          name: string
          state: string | null
          type: Database["public"]["Enums"]["election_type"]
          updated_at: string | null
          ward: string | null
        }
        Insert: {
          constituency?: string | null
          created_at?: string | null
          description?: string | null
          election_id?: string | null
          id?: string
          lga?: string | null
          name: string
          state?: string | null
          type: Database["public"]["Enums"]["election_type"]
          updated_at?: string | null
          ward?: string | null
        }
        Update: {
          constituency?: string | null
          created_at?: string | null
          description?: string | null
          election_id?: string | null
          id?: string
          lga?: string | null
          name?: string
          state?: string | null
          type?: Database["public"]["Enums"]["election_type"]
          updated_at?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "races_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          candidate_id: string | null
          collated_at: string | null
          created_at: string | null
          id: string
          polling_unit_id: string | null
          race_id: string | null
          status: Database["public"]["Enums"]["result_status"]
          updated_at: string | null
          votes: number
        }
        Insert: {
          candidate_id?: string | null
          collated_at?: string | null
          created_at?: string | null
          id?: string
          polling_unit_id?: string | null
          race_id?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          updated_at?: string | null
          votes?: number
        }
        Update: {
          candidate_id?: string | null
          collated_at?: string | null
          created_at?: string | null
          id?: string
          polling_unit_id?: string | null
          race_id?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          updated_at?: string | null
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_polling_unit_id_fkey"
            columns: ["polling_unit_id"]
            isOneToOne: false
            referencedRelation: "polling_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          provider: Database["public"]["Enums"]["provider_name"]
          records_created: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["sync_status"]
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider: Database["public"]["Enums"]["provider_name"]
          records_created?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"]
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["provider_name"]
          records_created?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"]
          sync_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      normalize_candidate_name: {
        Args: { full_name: string }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      candidate_status: "active" | "withdrawn" | "disqualified" | "deceased"
      election_status:
        | "upcoming"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "postponed"
      election_type:
        | "presidential"
        | "gubernatorial"
        | "senatorial"
        | "house_of_representatives"
        | "state_assembly"
        | "local_government"
        | "councilor"
      provider_name:
        | "inec_api"
        | "manual_import"
        | "civic_feeds"
        | "fact_check"
        | "inec_native"
      result_status: "pending" | "collated" | "disputed" | "final"
      sync_status: "pending" | "running" | "completed" | "failed"
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
      candidate_status: ["active", "withdrawn", "disqualified", "deceased"],
      election_status: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
        "postponed",
      ],
      election_type: [
        "presidential",
        "gubernatorial",
        "senatorial",
        "house_of_representatives",
        "state_assembly",
        "local_government",
        "councilor",
      ],
      provider_name: [
        "inec_api",
        "manual_import",
        "civic_feeds",
        "fact_check",
        "inec_native",
      ],
      result_status: ["pending", "collated", "disputed", "final"],
      sync_status: ["pending", "running", "completed", "failed"],
    },
  },
} as const

export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

export type Database = {
  public: {
    Enums: {
      ai_message_role: "assistant" | "system" | "user";
      budget_level: "luxury" | "premium" | "smart";
      luxury_level: "comfort" | "luxury" | "premium" | "ultraLuxury";
      notification_channel: "email" | "in_app" | "push";
      notification_category: "booking" | "heia" | "marketing" | "price_alert";
      trip_status: "confirmed" | "planning" | "wishlist";
      trip_type:
        | "adventure"
        | "business"
        | "couples"
        | "family"
        | "friends"
        | "luxury"
        | "solo"
        | "wellness";
      visa_preference: "easyVisa" | "flexible" | "visaFreeOnly";
      weather_preference: "cool" | "mild" | "snow" | "warm";
    };
    Functions: Record<string, never>;
    Tables: {
      ai_chat_messages: {
        Insert: {
          created_at?: string;
          id?: string;
          message_kind: string;
          message_payload: Json;
          role: Database["public"]["Enums"]["ai_message_role"];
          thread_id: string;
          user_id: string;
        };
        Relationships: [
          {
            columns: ["thread_id"];
            foreignKeyName: "ai_chat_messages_thread_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "ai_chat_threads";
          },
        ];
        Row: {
          created_at: string;
          id: string;
          message_kind: string;
          message_payload: Json;
          role: Database["public"]["Enums"]["ai_message_role"];
          thread_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_kind?: string;
          message_payload?: Json;
          role?: Database["public"]["Enums"]["ai_message_role"];
          thread_id?: string;
          user_id?: string;
        };
      };
      ai_chat_threads: {
        Insert: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          last_message_preview?: string | null;
          locale: "ar" | "en";
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          created_at: string;
          id: string;
          last_message_at: string;
          last_message_preview: string | null;
          locale: "ar" | "en";
          title: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          last_message_preview?: string | null;
          locale?: "ar" | "en";
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      notification_metadata: {
        Insert: {
          category: Database["public"]["Enums"]["notification_category"];
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          last_opened_at?: string | null;
          last_received_at?: string | null;
          metadata?: Json;
          muted_until?: string | null;
          unread_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          category: Database["public"]["Enums"]["notification_category"];
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          id: string;
          last_opened_at: string | null;
          last_received_at: string | null;
          metadata: Json;
          muted_until: string | null;
          unread_count: number;
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["notification_category"];
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          last_opened_at?: string | null;
          last_received_at?: string | null;
          metadata?: Json;
          muted_until?: string | null;
          unread_count?: number;
          updated_at?: string;
          user_id?: string;
        };
      };
      offer_bookmarks: {
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          offer_id: string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          offer_id: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          offer_id?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          departure_city?: string | null;
          email: string;
          first_name?: string | null;
          home_airport?: string | null;
          id: string;
          last_name?: string | null;
          phone?: string | null;
          preferred_locale?: "ar" | "en";
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          avatar_url: string | null;
          created_at: string;
          departure_city: string | null;
          email: string;
          first_name: string | null;
          home_airport: string | null;
          id: string;
          last_name: string | null;
          phone: string | null;
          preferred_locale: "ar" | "en";
          updated_at: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          departure_city?: string | null;
          email?: string;
          first_name?: string | null;
          home_airport?: string | null;
          id?: string;
          last_name?: string | null;
          phone?: string | null;
          preferred_locale?: "ar" | "en";
          updated_at?: string;
        };
      };
      saved_destinations: {
        Insert: {
          country_name?: string | null;
          created_at?: string;
          destination_name: string;
          destination_slug: string;
          id?: string;
          image_url?: string | null;
          package_id?: string | null;
          price_from?: number | null;
          source?: string | null;
          summary?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          country_name: string | null;
          created_at: string;
          destination_name: string;
          destination_slug: string;
          id: string;
          image_url: string | null;
          package_id: string | null;
          price_from: number | null;
          source: string | null;
          summary: string | null;
          updated_at: string;
          user_id: string;
        };
        Update: {
          country_name?: string | null;
          created_at?: string;
          destination_name?: string;
          destination_slug?: string;
          id?: string;
          image_url?: string | null;
          package_id?: string | null;
          price_from?: number | null;
          source?: string | null;
          summary?: string | null;
          updated_at?: string;
          user_id?: string;
        };
      };
      saved_trips: {
        Insert: {
          budget_max?: number | null;
          budget_min?: number | null;
          created_at?: string;
          departure_city?: string | null;
          destination: string;
          end_date: string;
          id?: string;
          notes?: string | null;
          progress_label?: string | null;
          start_date: string;
          status?: Database["public"]["Enums"]["trip_status"];
          title: string;
          travelers?: number;
          trip_type?: Database["public"]["Enums"]["trip_type"] | null;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          budget_max: number | null;
          budget_min: number | null;
          created_at: string;
          departure_city: string | null;
          destination: string;
          end_date: string;
          id: string;
          notes: string | null;
          progress_label: string | null;
          start_date: string;
          status: Database["public"]["Enums"]["trip_status"];
          title: string;
          travelers: number;
          trip_type: Database["public"]["Enums"]["trip_type"] | null;
          updated_at: string;
          user_id: string;
        };
        Update: {
          budget_max?: number | null;
          budget_min?: number | null;
          created_at?: string;
          departure_city?: string | null;
          destination?: string;
          end_date?: string;
          id?: string;
          notes?: string | null;
          progress_label?: string | null;
          start_date?: string;
          status?: Database["public"]["Enums"]["trip_status"];
          title?: string;
          travelers?: number;
          trip_type?: Database["public"]["Enums"]["trip_type"] | null;
          updated_at?: string;
          user_id?: string;
        };
      };
      travel_preferences: {
        Insert: {
          adults?: number | null;
          budget_level?: Database["public"]["Enums"]["budget_level"] | null;
          budget_max?: number | null;
          budget_min?: number | null;
          children?: number | null;
          created_at?: string;
          id?: string;
          infants?: number | null;
          luxury_level?: Database["public"]["Enums"]["luxury_level"] | null;
          notes?: string | null;
          preferred_trip_types?: Database["public"]["Enums"]["trip_type"][];
          preferred_vibes?: string[];
          seat_class?: string | null;
          updated_at?: string;
          user_id: string;
          visa_preference?: Database["public"]["Enums"]["visa_preference"] | null;
          weather_preference?: Database["public"]["Enums"]["weather_preference"] | null;
        };
        Relationships: [];
        Row: {
          adults: number | null;
          budget_level: Database["public"]["Enums"]["budget_level"] | null;
          budget_max: number | null;
          budget_min: number | null;
          children: number | null;
          created_at: string;
          id: string;
          infants: number | null;
          luxury_level: Database["public"]["Enums"]["luxury_level"] | null;
          notes: string | null;
          preferred_trip_types: Database["public"]["Enums"]["trip_type"][];
          preferred_vibes: string[];
          seat_class: string | null;
          updated_at: string;
          user_id: string;
          visa_preference: Database["public"]["Enums"]["visa_preference"] | null;
          weather_preference: Database["public"]["Enums"]["weather_preference"] | null;
        };
        Update: {
          adults?: number | null;
          budget_level?: Database["public"]["Enums"]["budget_level"] | null;
          budget_max?: number | null;
          budget_min?: number | null;
          children?: number | null;
          created_at?: string;
          id?: string;
          infants?: number | null;
          luxury_level?: Database["public"]["Enums"]["luxury_level"] | null;
          notes?: string | null;
          preferred_trip_types?: Database["public"]["Enums"]["trip_type"][];
          preferred_vibes?: string[];
          seat_class?: string | null;
          updated_at?: string;
          user_id?: string;
          visa_preference?: Database["public"]["Enums"]["visa_preference"] | null;
          weather_preference?: Database["public"]["Enums"]["weather_preference"] | null;
        };
      };
    };
    Views: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];

export type TableRow<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TableInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TableUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

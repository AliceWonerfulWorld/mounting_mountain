export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          show_in_ranking: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          show_in_ranking?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          show_in_ranking?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      solo_game_history: {
        Row: {
          id: string
          user_id: string
          total_score: number
          weather_id: string
          mission_id: string | null
          rounds_data: Json
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_score: number
          weather_id: string
          mission_id?: string | null
          rounds_data: Json
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_score?: number
          weather_id?: string
          mission_id?: string | null
          rounds_data?: Json
          completed?: boolean
          created_at?: string
        }
      }
      versus_game_history: {
        Row: {
          id: string
          user_id: string
          player1_name: string
          player2_name: string
          winner: string | null
          player1_score: number
          player2_score: number
          rounds_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          player1_name: string
          player2_name: string
          winner?: string | null
          player1_score: number
          player2_score: number
          rounds_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          player1_name?: string
          player2_name?: string
          winner?: string | null
          player1_score?: number
          player2_score?: number
          rounds_data?: Json
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          show_in_ranking: boolean
          best_score: number
          total_games: number
          completed_games: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

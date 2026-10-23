
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "admin_users": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"name": string,"notifications_seen_at": string,"role": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id": string,"name"?: string,"notifications_seen_at"?: string,"role"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"name"?: string,"notifications_seen_at"?: string,"role"?: string
                  }
                  Relationships: [
                    
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"diff": Json | null,"entity": string,"entity_id": string | null,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity": string,"entity_id"?: string | null,"id"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity"?: string,"entity_id"?: string | null,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"contact_promises": {
                  Row: {
                    "body": string,"id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"id"?: string,"sort_order"?: number
                  }
                  Update: {
                    "body"?: string,"id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"form_steps": {
                  Row: {
                    "fields": NonNullable<Json>,"id": string,"question": string,"step_number": number
                  }
                  ComputedFields: never
                  Insert: {
                    "fields"?: NonNullable<Json>,"id"?: string,"question": string,"step_number": number
                  }
                  Update: {
                    "fields"?: NonNullable<Json>,"id"?: string,"question"?: string,"step_number"?: number
                  }
                  Relationships: [
                    
                  ]
                },"hero_ctas": {
                  Row: {
                    "click_count": number,"href": string,"id": string,"is_visible": boolean,"label": string,"open_new_tab": boolean,"sort_order": number,"variant": Database["public"]['Enums']["cta_variant"]
                  }
                  ComputedFields: never
                  Insert: {
                    "click_count"?: number,"href": string,"id"?: string,"is_visible"?: boolean,"label": string,"open_new_tab"?: boolean,"sort_order"?: number,"variant"?: Database["public"]['Enums']["cta_variant"]
                  }
                  Update: {
                    "click_count"?: number,"href"?: string,"id"?: string,"is_visible"?: boolean,"label"?: string,"open_new_tab"?: boolean,"sort_order"?: number,"variant"?: Database["public"]['Enums']["cta_variant"]
                  }
                  Relationships: [
                    
                  ]
                },"lead_notes": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"id": string,"kind": string,"lead_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"id"?: string,"kind"?: string,"lead_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"lead_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lead_notes_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    }
                  ]
                },"leads": {
                  Row: {
                    "assigned_to_id": string | null,"budget_band": string | null,"company": string | null,"created_at": string,"email": string,"first_name": string,"first_reply_at": string | null,"fit_score": number,"goal": string,"id": string,"last_name": string,"message": string | null,"phone": string | null,"ref": string,"source": string,"status": Database["public"]['Enums']["lead_status"],"utm": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_to_id"?: string | null,"budget_band"?: string | null,"company"?: string | null,"created_at"?: string,"email": string,"first_name": string,"first_reply_at"?: string | null,"fit_score"?: number,"goal": string,"id"?: string,"last_name": string,"message"?: string | null,"phone"?: string | null,"ref": string,"source": string,"status"?: Database["public"]['Enums']["lead_status"],"utm"?: Json | null
                  }
                  Update: {
                    "assigned_to_id"?: string | null,"budget_band"?: string | null,"company"?: string | null,"created_at"?: string,"email"?: string,"first_name"?: string,"first_reply_at"?: string | null,"fit_score"?: number,"goal"?: string,"id"?: string,"last_name"?: string,"message"?: string | null,"phone"?: string | null,"ref"?: string,"source"?: string,"status"?: Database["public"]['Enums']["lead_status"],"utm"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "leads_assigned_to_fkey"
      columns: ["assigned_to_id"]
isOneToOne: false
      referencedRelation: "admin_users"
      referencedColumns: ["id"]
    }
                  ]
                },"media": {
                  Row: {
                    "alt": string | null,"bytes": number | null,"created_at": string,"height": number | null,"id": string,"uploaded_by_id": string | null,"url": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"bytes"?: number | null,"created_at"?: string,"height"?: number | null,"id"?: string,"uploaded_by_id"?: string | null,"url": string,"width"?: number | null
                  }
                  Update: {
                    "alt"?: string | null,"bytes"?: number | null,"created_at"?: string,"height"?: number | null,"id"?: string,"uploaded_by_id"?: string | null,"url"?: string,"width"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"page_sections": {
                  Row: {
                    "draft": NonNullable<Json>,"id": string,"page_slug": string,"published": Json | null,"published_at": string | null,"section_key": string,"updated_at": string,"updated_by_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "draft": NonNullable<Json>,"id"?: string,"page_slug": string,"published"?: Json | null,"published_at"?: string | null,"section_key": string,"updated_at"?: string,"updated_by_id"?: string | null
                  }
                  Update: {
                    "draft"?: NonNullable<Json>,"id"?: string,"page_slug"?: string,"published"?: Json | null,"published_at"?: string | null,"section_key"?: string,"updated_at"?: string,"updated_by_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"seo_defaults": {
                  Row: {
                    "default_og_image": string | null,"id": string,"sitemap_url": string | null,"title_template": string,"twitter_handle": string | null,"verification": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "default_og_image"?: string | null,"id"?: string,"sitemap_url"?: string | null,"title_template"?: string,"twitter_handle"?: string | null,"verification"?: Json | null
                  }
                  Update: {
                    "default_og_image"?: string | null,"id"?: string,"sitemap_url"?: string | null,"title_template"?: string,"twitter_handle"?: string | null,"verification"?: Json | null
                  }
                  Relationships: [
                    
                  ]
                },"seo_meta": {
                  Row: {
                    "canonical_url": string | null,"focus_keywords": (string)[],"id": string,"meta_description": string,"meta_title": string,"og_description": string | null,"og_image_url": string | null,"og_title": string | null,"page_slug": string,"path": string,"robots": string,"schema_type": string | null,"twitter_card": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "canonical_url"?: string | null,"focus_keywords"?: (string)[],"id"?: string,"meta_description": string,"meta_title": string,"og_description"?: string | null,"og_image_url"?: string | null,"og_title"?: string | null,"page_slug": string,"path": string,"robots"?: string,"schema_type"?: string | null,"twitter_card"?: string,"updated_at"?: string
                  }
                  Update: {
                    "canonical_url"?: string | null,"focus_keywords"?: (string)[],"id"?: string,"meta_description"?: string,"meta_title"?: string,"og_description"?: string | null,"og_image_url"?: string | null,"og_title"?: string | null,"page_slug"?: string,"path"?: string,"robots"?: string,"schema_type"?: string | null,"twitter_card"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"services": {
                  Row: {
                    "description": string,"href": string | null,"icon": string,"id": string,"is_visible": boolean,"kicker": string,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"href"?: string | null,"icon": string,"id"?: string,"is_visible"?: boolean,"kicker": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "description"?: string,"href"?: string | null,"icon"?: string,"id"?: string,"is_visible"?: boolean,"kicker"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "address_line1": string,"address_line2": string,"brand_name": string,"domain": string,"email": string,"gstin": string | null,"hours_label": string,"id": string,"logo_alt": string,"logo_height": number,"logo_url": string | null,"map_url": string | null,"phone": string,"tagline": string,"updated_at": string,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_line1": string,"address_line2": string,"brand_name": string,"domain": string,"email": string,"gstin"?: string | null,"hours_label": string,"id"?: string,"logo_alt"?: string,"logo_height"?: number,"logo_url"?: string | null,"map_url"?: string | null,"phone": string,"tagline": string,"updated_at"?: string,"whatsapp": string
                  }
                  Update: {
                    "address_line1"?: string,"address_line2"?: string,"brand_name"?: string,"domain"?: string,"email"?: string,"gstin"?: string | null,"hours_label"?: string,"id"?: string,"logo_alt"?: string,"logo_height"?: number,"logo_url"?: string | null,"map_url"?: string | null,"phone"?: string,"tagline"?: string,"updated_at"?: string,"whatsapp"?: string
                  }
                  Relationships: [
                    
                  ]
                },"social_links": {
                  Row: {
                    "id": string,"is_visible": boolean,"platform": string,"sort_order": number,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"is_visible"?: boolean,"platform": string,"sort_order"?: number,"url": string
                  }
                  Update: {
                    "id"?: string,"is_visible"?: boolean,"platform"?: string,"sort_order"?: number,"url"?: string
                  }
                  Relationships: [
                    
                  ]
                },"working_hours": {
                  Row: {
                    "closes_at": string | null,"day_of_week": number,"id": string,"is_closed": boolean,"opens_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "closes_at"?: string | null,"day_of_week": number,"id"?: string,"is_closed"?: boolean,"opens_at"?: string | null
                  }
                  Update: {
                    "closes_at"?: string | null,"day_of_week"?: number,"id"?: string,"is_closed"?: boolean,"opens_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "published_sections": {
                  Row: {
                    "page_slug": string | null,"published": Json | null,"published_at": string | null,"section_key": string | null
                  }
                  ComputedFields: never
                  Insert: {
                           "page_slug"?: string | null,"published"?: Json | null,"published_at"?: string | null,"section_key"?: string | null
                         }
                        Update: {
                           "page_slug"?: string | null,"published"?: Json | null,"published_at"?: string | null,"section_key"?: string | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "increment_cta_click":
{ Args: { "cta_id": string }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_notifications_seen":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"next_lead_ref":
{ Args: { "at"?: string }; Returns: string
                           }
          }
          Enums: {
            "content_status": "DRAFT"|"LIVE","cta_variant": "PRIMARY"|"OUTLINE"|"TEXT","lead_status": "NEW"|"CONTACTED"|"QUALIFIED"|"WON"|"LOST"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "content_status": ["DRAFT", "LIVE"],"cta_variant": ["PRIMARY", "OUTLINE", "TEXT"],"lead_status": ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]
          }
        }
} as const

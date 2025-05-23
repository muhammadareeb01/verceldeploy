export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banking_partners: {
        Row: {
          bank_id: string
          bank_name: string
          minimum_deposit: number | null
          processing_time_days: number | null
          required_documents_notes: string | null
        }
        Insert: {
          bank_id?: string
          bank_name: string
          minimum_deposit?: number | null
          processing_time_days?: number | null
          required_documents_notes?: string | null
        }
        Update: {
          bank_id?: string
          bank_name?: string
          minimum_deposit?: number | null
          processing_time_days?: number | null
          required_documents_notes?: string | null
        }
        Relationships: []
      }
      banking_services: {
        Row: {
          account_number: string | null
          account_type: string | null
          application_date: string | null
          approval_date: string | null
          bank_id: string | null
          case_banking_service_id: string
          case_id: string
          created_at: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          application_date?: string | null
          approval_date?: string | null
          bank_id?: string | null
          case_banking_service_id?: string
          case_id: string
          created_at?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          application_date?: string | null
          approval_date?: string | null
          bank_id?: string | null
          case_banking_service_id?: string
          case_id?: string
          created_at?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_banking_services_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banking_partners"
            referencedColumns: ["bank_id"]
          },
          {
            foreignKeyName: "case_banking_services_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
        ]
      }
      case_tasks: {
        Row: {
          case_id: string
          case_task_id: string
          created_at: string | null
          description: string | null
          document_type_id: string | null
          priority: number | null
          task_category_id: string | null
          task_name: string
          updated_at: string | null
        }
        Insert: {
          case_id: string
          case_task_id?: string
          created_at?: string | null
          description?: string | null
          document_type_id?: string | null
          priority?: number | null
          task_category_id?: string | null
          task_name: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          case_task_id?: string
          created_at?: string | null
          description?: string | null
          document_type_id?: string | null
          priority?: number | null
          task_category_id?: string | null
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "case_tasks_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["doc_type_id"]
          },
          {
            foreignKeyName: "case_tasks_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      cases: {
        Row: {
          actual_completion_date: string | null
          assigned_to: string | null
          case_id: string
          case_status: Database["public"]["Enums"]["case_status"]
          company_id: string
          created_at: string | null
          notes: string | null
          priority: number | null
          progress_percent: number | null
          remaining_budget: number | null
          service_id: string
          start_date: string | null
          target_date: string | null
          total_budget: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          assigned_to?: string | null
          case_id?: string
          case_status?: Database["public"]["Enums"]["case_status"]
          company_id: string
          created_at?: string | null
          notes?: string | null
          priority?: number | null
          progress_percent?: number | null
          remaining_budget?: number | null
          service_id: string
          start_date?: string | null
          target_date?: string | null
          total_budget?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          assigned_to?: string | null
          case_id?: string
          case_status?: Database["public"]["Enums"]["case_status"]
          company_id?: string
          created_at?: string | null
          notes?: string | null
          priority?: number | null
          progress_percent?: number | null
          remaining_budget?: number | null
          service_id?: string
          start_date?: string | null
          target_date?: string | null
          total_budget?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "cases_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      communications: {
        Row: {
          case_id: string | null
          comm_type: Database["public"]["Enums"]["communication_type"]
          communication_id: string
          company_id: string | null
          content: string
          created_at: string
          read: boolean
          sent_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          comm_type: Database["public"]["Enums"]["communication_type"]
          communication_id?: string
          company_id?: string | null
          content: string
          created_at?: string
          read?: boolean
          sent_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          comm_type?: Database["public"]["Enums"]["communication_type"]
          communication_id?: string
          company_id?: string | null
          content?: string
          created_at?: string
          read?: boolean
          sent_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "communications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_manager_id: string | null
          company_id: string
          country_of_origin: string | null
          created_at: string | null
          industry: string | null
          legal_structure: string | null
          name: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          registration_number: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_manager_id?: string | null
          company_id?: string
          country_of_origin?: string | null
          created_at?: string | null
          industry?: string | null
          legal_structure?: string | null
          name: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_manager_id?: string | null
          company_id?: string
          country_of_origin?: string | null
          created_at?: string | null
          industry?: string | null
          legal_structure?: string | null
          name?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tasks: {
        Row: {
          company_id: string
          company_task_id: string
          created_at: string | null
          description: string | null
          document_type_id: string | null
          priority: number | null
          task_category_id: string | null
          task_name: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          company_task_id?: string
          created_at?: string | null
          description?: string | null
          document_type_id?: string | null
          priority?: number | null
          task_category_id?: string | null
          task_name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          company_task_id?: string
          created_at?: string | null
          description?: string | null
          document_type_id?: string | null
          priority?: number | null
          task_category_id?: string | null
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_tasks_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["doc_type_id"]
          },
          {
            foreignKeyName: "company_tasks_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string | null
          description: string | null
          doc_type_id: string
          doc_type_name: string
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          doc_type_id?: string
          doc_type_name: string
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          doc_type_id?: string
          doc_type_name?: string
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_types_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          company_id: string
          created_at: string | null
          doc_name: string
          doc_type_id: string | null
          document_id: string
          notes: string | null
          provided_by: string | null
          review_by: string | null
          review_date: string | null
          status: Database["public"]["Enums"]["doc_status"] | null
          storage_path: string
          submission_date: string | null
          submitted_by: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          case_id?: string | null
          company_id: string
          created_at?: string | null
          doc_name: string
          doc_type_id?: string | null
          document_id?: string
          notes?: string | null
          provided_by?: string | null
          review_by?: string | null
          review_date?: string | null
          status?: Database["public"]["Enums"]["doc_status"] | null
          storage_path: string
          submission_date?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          case_id?: string | null
          company_id?: string
          created_at?: string | null
          doc_name?: string
          doc_type_id?: string | null
          document_id?: string
          notes?: string | null
          provided_by?: string | null
          review_by?: string | null
          review_date?: string | null
          status?: Database["public"]["Enums"]["doc_status"] | null
          storage_path?: string
          submission_date?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "documents_doc_type_id_fkey"
            columns: ["doc_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["doc_type_id"]
          },
          {
            foreignKeyName: "documents_provided_by_fkey"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_review_by_fkey"
            columns: ["review_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_milestones_template: {
        Row: {
          description: string
          fixed_amount: number | null
          milestone_template_id: string
          percentage: number | null
          service_id: string | null
          trigger_condition: string | null
        }
        Insert: {
          description: string
          fixed_amount?: number | null
          milestone_template_id?: string
          percentage?: number | null
          service_id?: string | null
          trigger_condition?: string | null
        }
        Update: {
          description?: string
          fixed_amount?: number | null
          milestone_template_id?: string
          percentage?: number | null
          service_id?: string | null
          trigger_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestones_template_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          case_id: string
          created_at: string | null
          due_date: string
          invoice_number: string | null
          milestone_description: string | null
          notes: string | null
          payment_date: string | null
          payment_id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          case_id: string
          created_at?: string | null
          due_date: string
          invoice_number?: string | null
          milestone_description?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          case_id?: string
          created_at?: string | null
          due_date?: string
          invoice_number?: string | null
          milestone_description?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_payments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      portal_access: {
        Row: {
          access_status:
            | Database["public"]["Enums"]["portal_access_status"]
            | null
          case_id: string
          created_at: string | null
          last_sync: string | null
          notes: string | null
          password_storage_ref: string | null
          portal_access_id: string
          portal_id: string
          registration_date: string | null
          responsible_person_id: string | null
          sync_status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          access_status?:
            | Database["public"]["Enums"]["portal_access_status"]
            | null
          case_id: string
          created_at?: string | null
          last_sync?: string | null
          notes?: string | null
          password_storage_ref?: string | null
          portal_access_id?: string
          portal_id: string
          registration_date?: string | null
          responsible_person_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          access_status?:
            | Database["public"]["Enums"]["portal_access_status"]
            | null
          case_id?: string
          created_at?: string | null
          last_sync?: string | null
          notes?: string | null
          password_storage_ref?: string | null
          portal_access_id?: string
          portal_id?: string
          registration_date?: string | null
          responsible_person_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_portal_access_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "case_portal_access_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "portal_access_responsible_person_id_fkey"
            columns: ["responsible_person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portals: {
        Row: {
          api_endpoint_template: string | null
          description: string | null
          login_url_template: string | null
          name: string
          portal_id: string
        }
        Insert: {
          api_endpoint_template?: string | null
          description?: string | null
          login_url_template?: string | null
          name: string
          portal_id?: string
        }
        Update: {
          api_endpoint_template?: string | null
          description?: string | null
          login_url_template?: string | null
          name?: string
          portal_id?: string
        }
        Relationships: []
      }
      predefined_tasks: {
        Row: {
          created_at: string | null
          default_responsible_role:
            | Database["public"]["Enums"]["user_role"]
            | null
          description: string | null
          document_type_id: string | null
          predefined_task_id: string
          priority: number | null
          service_id: string | null
          task_category_id: string | null
          task_name: string
          typical_duration_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_responsible_role?:
            | Database["public"]["Enums"]["user_role"]
            | null
          description?: string | null
          document_type_id?: string | null
          predefined_task_id?: string
          priority?: number | null
          service_id?: string | null
          task_category_id?: string | null
          task_name: string
          typical_duration_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_responsible_role?:
            | Database["public"]["Enums"]["user_role"]
            | null
          description?: string | null
          document_type_id?: string | null
          predefined_task_id?: string
          priority?: number | null
          service_id?: string | null
          task_category_id?: string | null
          task_name?: string
          typical_duration_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predefined_tasks_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["doc_type_id"]
          },
          {
            foreignKeyName: "predefined_tasks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "predefined_tasks_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role: string
        }
        Insert: {
          id?: string
          permission_id: string
          role: string
        }
        Update: {
          id?: string
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          category_id: string
          category_name: string
          description: string | null
        }
        Insert: {
          category_id?: string
          category_name: string
          description?: string | null
        }
        Update: {
          category_id?: string
          category_name?: string
          description?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          base_cost: number
          category_id: string | null
          description: string | null
          estimated_duration_days: number | null
          government_portal_template: string | null
          is_mandatory: boolean | null
          required_documents_template: string[] | null
          service_id: string
          service_name: string
        }
        Insert: {
          base_cost: number
          category_id?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          government_portal_template?: string | null
          is_mandatory?: boolean | null
          required_documents_template?: string[] | null
          service_id?: string
          service_name: string
        }
        Update: {
          base_cost?: number
          category_id?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          government_portal_template?: string | null
          is_mandatory?: boolean | null
          required_documents_template?: string[] | null
          service_id?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      task_categories: {
        Row: {
          category_id: string
          category_name: string
          description: string | null
        }
        Insert: {
          category_id?: string
          category_name: string
          description?: string | null
        }
        Update: {
          category_id?: string
          category_name?: string
          description?: string | null
        }
        Relationships: []
      }
      task_instances: {
        Row: {
          active: boolean | null
          actual_duration_days: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          notes: string | null
          origin_task_id: string | null
          origin_task_type:
            | Database["public"]["Enums"]["task_origin_type"]
            | null
          priority: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_instance_id: string
          task_name: string
          updated_at: string | null
          uploaded_document_id: string | null
        }
        Insert: {
          active?: boolean | null
          actual_duration_days?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          notes?: string | null
          origin_task_id?: string | null
          origin_task_type?:
            | Database["public"]["Enums"]["task_origin_type"]
            | null
          priority?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_instance_id?: string
          task_name: string
          updated_at?: string | null
          uploaded_document_id?: string | null
        }
        Update: {
          active?: boolean | null
          actual_duration_days?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          notes?: string | null
          origin_task_id?: string | null
          origin_task_type?:
            | Database["public"]["Enums"]["task_origin_type"]
            | null
          priority?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_instance_id?: string
          task_name?: string
          updated_at?: string | null
          uploaded_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_uploaded_document_id_fkey"
            columns: ["uploaded_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          default_responsible_role:
            | Database["public"]["Enums"]["user_role"]
            | null
          description: string | null
          is_mandatory: boolean | null
          required_output_document_type:
            | Database["public"]["Enums"]["document_type"]
            | null
          service_id: string | null
          standard_cost: number | null
          task_category_id: string | null
          task_name: string
          task_template_id: string
          typical_duration_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_responsible_role?:
            | Database["public"]["Enums"]["user_role"]
            | null
          description?: string | null
          is_mandatory?: boolean | null
          required_output_document_type?:
            | Database["public"]["Enums"]["document_type"]
            | null
          service_id?: string | null
          standard_cost?: number | null
          task_category_id?: string | null
          task_name: string
          task_template_id?: string
          typical_duration_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_responsible_role?:
            | Database["public"]["Enums"]["user_role"]
            | null
          description?: string | null
          is_mandatory?: boolean | null
          required_output_document_type?:
            | Database["public"]["Enums"]["document_type"]
            | null
          service_id?: string | null
          standard_cost?: number | null
          task_category_id?: string | null
          task_name?: string
          task_template_id?: string
          typical_duration_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "task_templates_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_cost: number | null
          actual_duration_days: number | null
          assigned_to: string | null
          case_id: string | null
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          document_id: string | null
          due_date: string | null
          is_critical: boolean | null
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_category_id: string | null
          task_id: string
          task_name: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_duration_days?: number | null
          assigned_to?: string | null
          case_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          is_critical?: boolean | null
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_category_id?: string | null
          task_id?: string
          task_name: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_duration_days?: number | null
          assigned_to?: string | null
          case_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          is_critical?: boolean | null
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_category_id?: string | null
          task_id?: string
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "tasks_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      visa_services: {
        Row: {
          case_id: string
          created_at: string | null
          insurance_status: string | null
          iqama_number: string | null
          medical_status: string | null
          nationality: string | null
          notes: string | null
          passport_number: string | null
          updated_at: string | null
          visa_service_id: string
          visa_type: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          insurance_status?: string | null
          iqama_number?: string | null
          medical_status?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          updated_at?: string | null
          visa_service_id?: string
          visa_type?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          insurance_status?: string | null
          iqama_number?: string | null
          medical_status?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          updated_at?: string | null
          visa_service_id?: string
          visa_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_visa_services_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_change_roles: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_delete_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_edit_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_case_status_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_recent_cases: {
        Args: { limit_num?: number }
        Returns: Json
      }
      get_task_groups: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
    }
    Enums: {
      case_status:
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "ON_HOLD"
        | "CANCELLED"
      communication_type: "ANNOUNCEMENT" | "CASE" | "CLIENT" | "TASK"
      compliance_status: "PENDING" | "MET" | "NOT_APPLICABLE" | "OVERDUE"
      doc_status:
        | "NOT_SUBMITTED"
        | "SUBMITTED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "CLIENT_ACTION_REQUIRED"
      document_type:
        | "IDENTIFICATION"
        | "REGISTRATION"
        | "LEGAL"
        | "BUSINESS"
        | "FINANCIAL"
        | "BANKING"
        | "GOVERNMENT_FORM"
        | "TRANSLATION"
        | "AUTHORIZATION"
        | "MOA"
        | "AOA"
        | "LICENSE"
        | "VISA_DOCUMENT"
        | "MEDICAL_REPORT"
        | "INSURANCE_DOCUMENT"
        | "OTHER"
      payment_status:
        | "DUE"
        | "PAID"
        | "PARTIAL"
        | "UNPAID"
        | "OVERDUE"
        | "WAIVED"
        | "CANCELLED"
      portal_access_status:
        | "ACTIVE"
        | "PENDING_ACTIVATION"
        | "NOT_REGISTERED"
        | "LOCKED"
      task_origin_type: "PREDEFINED" | "COMPANY" | "CASE"
      task_status:
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "BLOCKED"
        | "ON_HOLD"
      user_role:
        | "ADMIN"
        | "ACCOUNT_MANAGER"
        | "DOCUMENT_SPECIALIST"
        | "FINANCE_OFFICER"
        | "CLIENT"
        | "MANAGER"
        | "OFFICER"
        | "STAFF"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_status: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "ON_HOLD",
        "CANCELLED",
      ],
      communication_type: ["ANNOUNCEMENT", "CASE", "CLIENT", "TASK"],
      compliance_status: ["PENDING", "MET", "NOT_APPLICABLE", "OVERDUE"],
      doc_status: [
        "NOT_SUBMITTED",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "CLIENT_ACTION_REQUIRED",
      ],
      document_type: [
        "IDENTIFICATION",
        "REGISTRATION",
        "LEGAL",
        "BUSINESS",
        "FINANCIAL",
        "BANKING",
        "GOVERNMENT_FORM",
        "TRANSLATION",
        "AUTHORIZATION",
        "MOA",
        "AOA",
        "LICENSE",
        "VISA_DOCUMENT",
        "MEDICAL_REPORT",
        "INSURANCE_DOCUMENT",
        "OTHER",
      ],
      payment_status: [
        "DUE",
        "PAID",
        "PARTIAL",
        "UNPAID",
        "OVERDUE",
        "WAIVED",
        "CANCELLED",
      ],
      portal_access_status: [
        "ACTIVE",
        "PENDING_ACTIVATION",
        "NOT_REGISTERED",
        "LOCKED",
      ],
      task_origin_type: ["PREDEFINED", "COMPANY", "CASE"],
      task_status: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
        "BLOCKED",
        "ON_HOLD",
      ],
      user_role: [
        "ADMIN",
        "ACCOUNT_MANAGER",
        "DOCUMENT_SPECIALIST",
        "FINANCE_OFFICER",
        "CLIENT",
        "MANAGER",
        "OFFICER",
        "STAFF",
      ],
    },
  },
} as const

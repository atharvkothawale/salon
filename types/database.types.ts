export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentMethod = "PAY_AT_SALON" | "ONLINE";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EventType = "CREATED" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          duration_minutes: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          role_title: string;
          bio: string | null;
          phone: string | null;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          role_title: string;
          bio?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          full_name?: string;
          role_title?: string;
          bio?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      staff_services: {
        Row: {
          staff_id: string;
          service_id: string;
        };
        Insert: {
          staff_id: string;
          service_id: string;
        };
        Update: {
          staff_id?: string;
          service_id?: string;
        };
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: number;
          is_open: boolean;
          open_time: string;
          close_time: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          is_open?: boolean;
          open_time: string;
          close_time: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          is_open?: boolean;
          open_time?: string;
          close_time?: string;
        };
      };
      staff_working_hours: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: number;
          is_working: boolean;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          day_of_week: number;
          is_working?: boolean;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          day_of_week?: number;
          is_working?: boolean;
          start_time?: string;
          end_time?: string;
        };
      };
      staff_breaks: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
        };
      };
      staff_leaves: {
        Row: {
          id: string;
          staff_id: string;
          start_datetime: string;
          end_datetime: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          staff_id: string;
          start_datetime: string;
          end_datetime: string;
          reason?: string | null;
        };
        Update: {
          id?: string;
          staff_id?: string;
          start_datetime?: string;
          end_datetime?: string;
          reason?: string | null;
        };
      };
      salon_closures: {
        Row: {
          id: string;
          start_datetime: string;
          end_datetime: string;
          reason: string;
        };
        Insert: {
          id?: string;
          start_datetime: string;
          end_datetime: string;
          reason: string;
        };
        Update: {
          id?: string;
          start_datetime?: string;
          end_datetime?: string;
          reason?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          booking_code: string;
          customer_id: string;
          staff_id: string | null;
          service_id: string;
          start_datetime: string;
          end_datetime: string;
          appointment_status: AppointmentStatus;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod;
          amount: number;
          notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          customer_id: string;
          staff_id?: string | null;
          service_id: string;
          start_datetime: string;
          end_datetime: string;
          appointment_status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod;
          amount: number;
          notes?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          customer_id?: string;
          staff_id?: string | null;
          service_id?: string;
          start_datetime?: string;
          end_datetime?: string;
          appointment_status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod;
          amount?: number;
          notes?: string | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      appointment_events: {
        Row: {
          id: string;
          appointment_id: string;
          event_type: EventType;
          old_status: AppointmentStatus | null;
          new_status: AppointmentStatus | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          event_type: EventType;
          old_status?: AppointmentStatus | null;
          new_status?: AppointmentStatus | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          event_type?: EventType;
          old_status?: AppointmentStatus | null;
          new_status?: AppointmentStatus | null;
          metadata?: Json | null;
        };
      };
      payments: {
        Row: {
          id: string;
          appointment_id: string;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          provider: string | null;
          provider_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          amount: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          provider?: string | null;
          provider_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          amount?: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          provider?: string | null;
          provider_reference?: string | null;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          minimum_amount: number;
          valid_from: string;
          valid_until: string;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          minimum_amount?: number;
          valid_from: string;
          valid_until: string;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: DiscountType;
          discount_value?: number;
          minimum_amount?: number;
          valid_from?: string;
          valid_until?: string;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      coupon_redemptions: {
        Row: {
          id: string;
          coupon_id: string;
          customer_id: string;
          appointment_id: string;
          discount_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          customer_id: string;
          appointment_id: string;
          discount_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          customer_id?: string;
          appointment_id?: string;
          discount_amount?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          appointment_id: string;
          customer_id: string;
          rating: number;
          comment: string | null;
          moderation_status: ModerationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          customer_id: string;
          rating: number;
          comment?: string | null;
          moderation_status?: ModerationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          customer_id?: string;
          rating?: number;
          comment?: string | null;
          moderation_status?: ModerationStatus;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read_at?: string | null;
        };
      };
      salon_settings: {
        Row: {
          id: string;
          salon_name: string;
          logo_url: string | null;
          address: string;
          phone: string;
          email: string;
          cancellation_policy: string | null;
          booking_interval_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_name?: string;
          logo_url?: string | null;
          address?: string;
          phone?: string;
          email?: string;
          cancellation_policy?: string | null;
          booking_interval_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_name?: string;
          logo_url?: string | null;
          address?: string;
          phone?: string;
          email?: string;
          cancellation_policy?: string | null;
          booking_interval_minutes?: number;
          updated_at?: string;
        };
      };
    };
  };
}

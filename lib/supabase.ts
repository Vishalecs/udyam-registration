import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface UdyamRegistration {
  id: string
  application_number?: string
  aadhaar_number: string
  applicant_name: string
  aadhaar_consent: boolean
  mobile_number?: string
  otp_verified: boolean
  organization_type?: string
  pan_number?: string
  pan_holder_name?: string
  pan_dob_or_doi?: string
  pan_consent: boolean
  pan_verified: boolean
  current_step: number
  status: "draft" | "submitted" | "approved" | "rejected"
  created_at: string
  updated_at: string
  submitted_at?: string
}

export interface OTPVerification {
  id: string
  registration_id: string
  mobile_number: string
  otp_code: string
  expires_at: string
  verified: boolean
  attempts: number
  created_at: string
}

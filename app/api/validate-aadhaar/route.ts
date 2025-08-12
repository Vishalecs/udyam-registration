import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { aadhaar_number, applicant_name, aadhaar_consent } = await request.json()

    // Validate input
    if (!aadhaar_number || !applicant_name || !aadhaar_consent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate Aadhaar format
    if (!/^[0-9]{12}$/.test(aadhaar_number)) {
      return NextResponse.json({ error: "Invalid Aadhaar number format" }, { status: 400 })
    }

    // Check if Aadhaar already exists
    const { data: existingRegistration } = await supabase
      .from("udyam_registrations")
      .select("id")
      .eq("aadhaar_number", aadhaar_number)
      .single()

    if (existingRegistration) {
      return NextResponse.json({ error: "Aadhaar number already registered" }, { status: 409 })
    }

    // In real implementation, this would call UIDAI API
    // For demo, we'll simulate the response
    const mockMobileNumber = "9876542629"

    // Create registration record
    const { data: registration, error } = await supabase
      .from("udyam_registrations")
      .insert({
        aadhaar_number,
        applicant_name,
        aadhaar_consent,
        mobile_number: mockMobileNumber,
        current_step: 1,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
    }

    // Generate and store OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { error: otpError } = await supabase.from("otp_verifications").insert({
      registration_id: registration.id,
      mobile_number: mockMobileNumber,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
    })

    if (otpError) {
      console.error("OTP creation error:", otpError)
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
    }

    // In production, send OTP via SMS service
    console.log(`OTP for ${mockMobileNumber}: ${otpCode}`)

    return NextResponse.json({
      success: true,
      registration_id: registration.id,
      mobile_number: mockMobileNumber,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Aadhaar validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

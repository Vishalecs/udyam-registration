import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { registration_id, organization_type, pan_number, pan_holder_name, pan_dob_or_doi, pan_consent } =
      await request.json()

    // Validate input
    if (!registration_id || !organization_type || !pan_number || !pan_holder_name || !pan_dob_or_doi || !pan_consent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate PAN format
    if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(pan_number)) {
      return NextResponse.json({ error: "Invalid PAN format" }, { status: 400 })
    }

    // Check if registration exists and OTP is verified
    const { data: registration, error: regError } = await supabase
      .from("udyam_registrations")
      .select("*")
      .eq("id", registration_id)
      .eq("otp_verified", true)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: "Registration not found or OTP not verified" }, { status: 404 })
    }

    // Check if PAN already exists in another registration
    const { data: existingPan } = await supabase
      .from("udyam_registrations")
      .select("id")
      .eq("pan_number", pan_number)
      .neq("id", registration_id)
      .single()

    if (existingPan) {
      return NextResponse.json({ error: "PAN number already registered" }, { status: 409 })
    }

    // In real implementation, this would call Income Tax API for PAN verification
    // For demo, we'll simulate successful validation

    // Generate application number
    const applicationNumber = `UDYAM-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Update registration with PAN details
    const { data: updatedRegistration, error: updateError } = await supabase
      .from("udyam_registrations")
      .update({
        organization_type,
        pan_number: pan_number.toUpperCase(),
        pan_holder_name,
        pan_dob_or_doi,
        pan_consent,
        pan_verified: true,
        current_step: 2,
        status: "submitted",
        application_number: applicationNumber,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", registration_id)
      .select()
      .single()

    if (updateError) {
      console.error("Registration update error:", updateError)
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      application_number: applicationNumber,
      registration: updatedRegistration,
      message: "Registration completed successfully",
    })
  } catch (error) {
    console.error("PAN validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { registration_id, otp_code } = await request.json()

    if (!registration_id || !otp_code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate OTP format
    if (!/^[0-9]{6}$/.test(otp_code)) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 })
    }

    // Find the latest OTP for this registration
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("registration_id", registration_id)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: "OTP not found or already verified" }, { status: 404 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ error: "Too many failed attempts" }, { status: 429 })
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp_code) {
      // Increment attempts
      await supabase
        .from("otp_verifications")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id)

      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // Mark OTP as verified
    const { error: updateOtpError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpRecord.id)

    if (updateOtpError) {
      console.error("OTP update error:", updateOtpError)
      return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
    }

    // Update registration record
    const { error: updateRegError } = await supabase
      .from("udyam_registrations")
      .update({ otp_verified: true })
      .eq("id", registration_id)

    if (updateRegError) {
      console.error("Registration update error:", updateRegError)
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

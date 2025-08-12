import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: registration, error } = await supabase
      .from("udyam_registrations")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { aadhaar_number, ...safeRegistration } = registration

    return NextResponse.json({
      success: true,
      registration: {
        ...safeRegistration,
        aadhaar_number: `****-****-${aadhaar_number.slice(-4)}`,
      },
    })
  } catch (error) {
    console.error("Get registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    // Remove sensitive fields that shouldn't be updated directly
    const { id, aadhaar_number, created_at, ...allowedUpdates } = updates

    const { data: registration, error } = await supabase
      .from("udyam_registrations")
      .update(allowedUpdates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Update registration error:", error)
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registration,
    })
  } catch (error) {
    console.error("Update registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

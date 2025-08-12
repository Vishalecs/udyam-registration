import { POST } from "@/app/api/validate-aadhaar/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

describe("/api/validate-aadhaar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should validate Aadhaar and generate OTP successfully", async () => {
    const { supabase } = require("@/lib/supabase")

    // Mock no existing registration
    supabase.from().select().eq().single.mockResolvedValueOnce({ data: null, error: null })

    // Mock successful registration creation
    supabase
      .from()
      .insert()
      .select()
      .single.mockResolvedValueOnce({
        data: { id: "test-id", aadhaar_number: "123456789012" },
        error: null,
      })

    // Mock successful OTP creation
    supabase.from().insert.mockResolvedValueOnce({ error: null })

    const request = new NextRequest("http://localhost:3000/api/validate-aadhaar", {
      method: "POST",
      body: JSON.stringify({
        aadhaar_number: "123456789012",
        applicant_name: "John Doe",
        aadhaar_consent: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.registration_id).toBe("test-id")
    expect(data.mobile_number).toBe("9876542629")
  })

  it("should return error for invalid Aadhaar format", async () => {
    const request = new NextRequest("http://localhost:3000/api/validate-aadhaar", {
      method: "POST",
      body: JSON.stringify({
        aadhaar_number: "invalid",
        applicant_name: "John Doe",
        aadhaar_consent: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid Aadhaar number format")
  })

  it("should return error for missing consent", async () => {
    const request = new NextRequest("http://localhost:3000/api/validate-aadhaar", {
      method: "POST",
      body: JSON.stringify({
        aadhaar_number: "123456789012",
        applicant_name: "John Doe",
        aadhaar_consent: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Missing required fields")
  })

  it("should return error for existing Aadhaar", async () => {
    const { supabase } = require("@/lib/supabase")

    // Mock existing registration
    supabase
      .from()
      .select()
      .eq()
      .single.mockResolvedValueOnce({
        data: { id: "existing-id" },
        error: null,
      })

    const request = new NextRequest("http://localhost:3000/api/validate-aadhaar", {
      method: "POST",
      body: JSON.stringify({
        aadhaar_number: "123456789012",
        applicant_name: "John Doe",
        aadhaar_consent: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe("Aadhaar number already registered")
  })
})

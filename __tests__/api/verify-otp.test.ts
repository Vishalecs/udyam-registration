import { POST } from "@/app/api/verify-otp/route"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}))

describe("/api/verify-otp", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should verify OTP successfully", async () => {
    const { supabase } = require("@/lib/supabase")

    // Mock valid OTP record
    const mockOtpRecord = {
      id: "otp-id",
      otp_code: "123456",
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      attempts: 0,
    }

    supabase.from().select().eq().order().limit().single.mockResolvedValueOnce({
      data: mockOtpRecord,
      error: null,
    })

    // Mock successful updates
    supabase.from().update().eq.mockResolvedValue({ error: null })

    const request = new NextRequest("http://localhost:3000/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        registration_id: "test-id",
        otp_code: "123456",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("OTP verified successfully")
  })

  it("should return error for invalid OTP", async () => {
    const { supabase } = require("@/lib/supabase")

    const mockOtpRecord = {
      id: "otp-id",
      otp_code: "123456",
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      attempts: 0,
    }

    supabase.from().select().eq().order().limit().single.mockResolvedValueOnce({
      data: mockOtpRecord,
      error: null,
    })

    supabase.from().update().eq.mockResolvedValue({ error: null })

    const request = new NextRequest("http://localhost:3000/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        registration_id: "test-id",
        otp_code: "654321", // Wrong OTP
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid OTP")
  })

  it("should return error for expired OTP", async () => {
    const { supabase } = require("@/lib/supabase")

    const mockOtpRecord = {
      id: "otp-id",
      otp_code: "123456",
      expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Expired
      attempts: 0,
    }

    supabase.from().select().eq().order().limit().single.mockResolvedValueOnce({
      data: mockOtpRecord,
      error: null,
    })

    const request = new NextRequest("http://localhost:3000/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        registration_id: "test-id",
        otp_code: "123456",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("OTP has expired")
  })
})

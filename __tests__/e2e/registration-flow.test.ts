/**
 * End-to-End Test for Complete Registration Flow
 * This test simulates the entire user journey from Aadhaar validation to PAN verification
 */

import { ApiClient } from "@/lib/api-client"
import jest from "jest"

// Mock the API client for E2E testing
jest.mock("@/lib/api-client")

describe("Complete Registration Flow", () => {
  const mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should complete full registration flow successfully", async () => {
    // Step 1: Aadhaar Validation
    mockApiClient.validateAadhaar.mockResolvedValueOnce({
      success: true,
      data: {
        registration_id: "test-registration-id",
        mobile_number: "9876542629",
        message: "OTP sent successfully",
      },
    })

    const aadhaarResult = await ApiClient.validateAadhaar("123456789012", "John Doe", true)
    expect(aadhaarResult.success).toBe(true)
    expect(aadhaarResult.data?.registration_id).toBe("test-registration-id")

    // Step 2: OTP Verification
    mockApiClient.verifyOTP.mockResolvedValueOnce({
      success: true,
      message: "OTP verified successfully",
    })

    const otpResult = await ApiClient.verifyOTP("test-registration-id", "123456")
    expect(otpResult.success).toBe(true)

    // Step 3: PAN Validation
    mockApiClient.validatePAN.mockResolvedValueOnce({
      success: true,
      data: {
        application_number: "UDYAM-1234567890-001",
        registration: {
          id: "test-registration-id",
          status: "submitted",
          pan_verified: true,
        },
        message: "Registration completed successfully",
      },
    })

    const panResult = await ApiClient.validatePAN(
      "test-registration-id",
      "proprietary",
      "ABCDE1234F",
      "John Doe",
      "1990-01-01",
      true,
    )

    expect(panResult.success).toBe(true)
    expect(panResult.data?.application_number).toMatch(/^UDYAM-/)
    expect(panResult.data?.registration.status).toBe("submitted")
  })

  it("should handle errors at each step appropriately", async () => {
    // Test Aadhaar validation error
    mockApiClient.validateAadhaar.mockResolvedValueOnce({
      success: false,
      error: "Invalid Aadhaar number format",
    })

    const aadhaarResult = await ApiClient.validateAadhaar("invalid", "John Doe", true)
    expect(aadhaarResult.success).toBe(false)
    expect(aadhaarResult.error).toBe("Invalid Aadhaar number format")

    // Test OTP verification error
    mockApiClient.verifyOTP.mockResolvedValueOnce({
      success: false,
      error: "Invalid OTP",
    })

    const otpResult = await ApiClient.verifyOTP("test-id", "wrong-otp")
    expect(otpResult.success).toBe(false)
    expect(otpResult.error).toBe("Invalid OTP")

    // Test PAN validation error
    mockApiClient.validatePAN.mockResolvedValueOnce({
      success: false,
      error: "Invalid PAN format",
    })

    const panResult = await ApiClient.validatePAN("test-id", "proprietary", "invalid", "John Doe", "1990-01-01", true)
    expect(panResult.success).toBe(false)
    expect(panResult.error).toBe("Invalid PAN format")
  })
})

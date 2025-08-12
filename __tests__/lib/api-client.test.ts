import { ApiClient } from "@/lib/api-client"
import { jest } from "@jest/globals"

global.fetch = jest.fn()

describe("ApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("validateAadhaar", () => {
    it("should make successful API call", async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          registration_id: "test-id",
          mobile_number: "9876542629",
          message: "OTP sent successfully",
        }),
      } as Response)

      const result = await ApiClient.validateAadhaar("123456789012", "John Doe", true)

      expect(result.success).toBe(true)
      expect(result.data?.registration_id).toBe("test-id")
      expect(mockFetch).toHaveBeenCalledWith("/api/validate-aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaar_number: "123456789012",
          applicant_name: "John Doe",
          aadhaar_consent: true,
        }),
      })
    })

    it("should handle API errors", async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid Aadhaar number format" }),
      } as Response)

      const result = await ApiClient.validateAadhaar("invalid", "John Doe", true)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid Aadhaar number format")
    })

    it("should handle network errors", async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const result = await ApiClient.validateAadhaar("123456789012", "John Doe", true)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Network error occurred")
    })
  })

  describe("verifyOTP", () => {
    it("should verify OTP successfully", async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "OTP verified successfully",
        }),
      } as Response)

      const result = await ApiClient.verifyOTP("test-id", "123456")

      expect(result.success).toBe(true)
      expect(result.message).toBe("OTP verified successfully")
    })
  })

  describe("validatePAN", () => {
    it("should validate PAN successfully", async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          application_number: "UDYAM-123456789-001",
          message: "Registration completed successfully",
        }),
      } as Response)

      const result = await ApiClient.validatePAN("test-id", "proprietary", "ABCDE1234F", "John Doe", "1990-01-01", true)

      expect(result.success).toBe(true)
      expect(result.data?.application_number).toMatch(/^UDYAM-/)
    })
  })
})

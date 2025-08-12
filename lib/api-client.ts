// API client functions for frontend to use

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
        }
      }

      return {
        success: true,
        data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  static async validateAadhaar(aadhaar_number: string, applicant_name: string, aadhaar_consent: boolean) {
    return this.request("/validate-aadhaar", {
      method: "POST",
      body: JSON.stringify({ aadhaar_number, applicant_name, aadhaar_consent }),
    })
  }

  static async verifyOTP(registration_id: string, otp_code: string) {
    return this.request("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ registration_id, otp_code }),
    })
  }

  static async validatePAN(
    registration_id: string,
    organization_type: string,
    pan_number: string,
    pan_holder_name: string,
    pan_dob_or_doi: string,
    pan_consent: boolean,
  ) {
    return this.request("/validate-pan", {
      method: "POST",
      body: JSON.stringify({
        registration_id,
        organization_type,
        pan_number,
        pan_holder_name,
        pan_dob_or_doi,
        pan_consent,
      }),
    })
  }

  static async getRegistration(id: string) {
    return this.request(`/registration/${id}`)
  }

  static async updateRegistration(id: string, updates: any) {
    return this.request(`/registration/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }
}

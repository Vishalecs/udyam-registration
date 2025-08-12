"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Shield, Building, Sparkles, Lock } from "lucide-react"

const ORGANIZATION_TYPES = [
  { value: "proprietary", label: "Proprietary / एकल स्वामित्व" },
  { value: "huf", label: "Hindu Undivided Family / हिंदू अविभाजित परिवार (एचयूएफ)" },
  { value: "partnership", label: "Partnership / पार्टनरशिप" },
  { value: "cooperative", label: "Co-Operative / सहकारी" },
  { value: "private_limited", label: "Private Limited Company / प्राइवेट लिमिटेड कंपनी" },
  { value: "public_limited", label: "Public Limited Company / पब्लिक लिमिटेड कंपनी" },
  { value: "self_help_group", label: "Self Help Group / स्वयं सहायता समूह" },
  { value: "llp", label: "Limited Liability Partnership / सीमित दायित्व भागीदारी" },
  { value: "society", label: "Society / सोसाईटी" },
  { value: "trust", label: "Trust / ट्रस्ट" },
  { value: "others", label: "Others / अन्य" },
]

export function UdyamRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [maskedMobile, setMaskedMobile] = useState("")
  const [panValidated, setPanValidated] = useState(false)

  const progress = (currentStep / 2) * 100

  const validateAadhaar = (aadhaar: string): string | null => {
    if (!aadhaar.trim()) return "Aadhaar number is required"
    if (!/^[0-9]{12}$/.test(aadhaar)) return "Aadhaar number must be exactly 12 digits"
    return null
  }

  const validatePAN = (pan: string): string | null => {
    if (!pan.trim()) return "PAN number is required"
    if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(pan)) {
      return "PAN format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)"
    }
    return null
  }

  const validateOTP = (otp: string): string | null => {
    if (!otp.trim()) return "OTP is required"
    if (!/^[0-9]{6}$/.test(otp)) return "OTP must be exactly 6 digits"
    return null
  }

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }))
    }
  }

  const maskMobileNumber = (mobile: string): string => {
    if (mobile.length >= 4) {
      return "*".repeat(mobile.length - 4) + mobile.slice(-4)
    }
    return mobile
  }

  const handleValidateAadhaar = async () => {
    const aadhaarError = validateAadhaar((formData.aadhaar_number as string) || "")
    const nameError = !formData.applicant_name ? "Name is required" : null
    const consentError = !formData.aadhaar_consent ? "Please provide consent to proceed" : null

    if (aadhaarError || nameError || consentError) {
      setErrors({
        aadhaar_number: aadhaarError || "",
        applicant_name: nameError || "",
        aadhaar_consent: consentError || "",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call to validate Aadhaar and get mobile number
    setTimeout(() => {
      const mockMobile = "9876542629" // This would come from Aadhaar API
      setMaskedMobile(maskMobileNumber(mockMobile))
      setFormData((prev) => ({ ...prev, mobile_number: mockMobile }))
      setOtpSent(true)
      setIsLoading(false)
    }, 2000)
  }

  const handleValidatePAN = async () => {
    const panError = validatePAN((formData.pan_number as string) || "")
    const nameError = !formData.pan_holder_name ? "PAN holder name is required" : null
    const dobError = !formData.pan_dob_or_doi ? "Date of birth/incorporation is required" : null
    const orgError = !formData.organization_type ? "Organization type is required" : null
    const consentError = !formData.pan_consent ? "Please provide consent to proceed" : null

    if (panError || nameError || dobError || orgError || consentError) {
      setErrors({
        pan_number: panError || "",
        pan_holder_name: nameError || "",
        pan_dob_or_doi: dobError || "",
        organization_type: orgError || "",
        pan_consent: consentError || "",
      })
      return
    }

    setIsLoading(true)
    // Simulate PAN validation
    setTimeout(() => {
      setIsLoading(false)
      setPanValidated(true)
    }, 2000)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const otpError = validateOTP((formData.otp as string) || "")
      if (otpError) {
        setErrors({ otp: otpError })
        return
      }
    }
    setCurrentStep(2)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Building className="h-10 w-10 text-white" />
            <Sparkles className="h-6 w-6 text-white/80 absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Udyam Registration
          </h1>
          <p className="text-gray-600 text-lg">Register your MSME business with Government of India</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Secure & Government Verified</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Step {currentStep} of 2
            </span>
            <span className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-4 bg-white/60 backdrop-blur-sm rounded-full shadow-inner" />
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95 transform hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
              {currentStep === 1 ? <Shield className="h-7 w-7" /> : <Building className="h-7 w-7" />}
              {currentStep === 1 ? "Aadhaar Verification" : "PAN Verification"}
            </CardTitle>
            <CardDescription className="text-blue-100 text-base relative z-10">
              {currentStep === 1
                ? "Verify your identity using Aadhaar number"
                : "Complete your business registration with PAN details"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {panValidated && currentStep === 2 && (
              <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  <div className="space-y-2">
                    <p className="font-semibold">Your PAN has been successfully verified.</p>
                    <p className="text-sm">
                      Some fields of the form will be disabled. Disabled fields will be automatically filled after
                      verification from PAN data.
                    </p>
                    <p className="text-sm">
                      <strong>GSTIN</strong> (As per applicability of CGST Act 2017 and as notified by the ministry of
                      MSME vide S.O. 1055(E) dated 05th March 2021) is required for Udyam Registration w.e.f.
                      01.04.2021. You are advised to apply for GSTIN suitably to avoid any inconvenience.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {currentStep === 1 ? (
              <>
                <div className="space-y-3">
                  <Label
                    htmlFor="aadhaar_number"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-blue-600" />
                    Aadhaar Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="aadhaar_number"
                    type="text"
                    placeholder="Enter 12-digit Aadhaar Number"
                    value={(formData.aadhaar_number as string) || ""}
                    onChange={(e) => handleInputChange("aadhaar_number", e.target.value)}
                    maxLength={12}
                    className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 focus:scale-[1.02] ${
                      errors.aadhaar_number
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    }`}
                  />
                  {errors.aadhaar_number && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.aadhaar_number}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="applicant_name" className="text-sm font-semibold text-gray-700">
                    Name as per Aadhaar <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="applicant_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={(formData.applicant_name as string) || ""}
                    onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                    className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 focus:scale-[1.02] ${
                      errors.applicant_name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    }`}
                  />
                  {errors.applicant_name && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.applicant_name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-inner">
                    <Checkbox
                      id="aadhaar_consent"
                      checked={(formData.aadhaar_consent as boolean) || false}
                      onCheckedChange={(checked) => handleInputChange("aadhaar_consent", checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <Label htmlFor="aadhaar_consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                      I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME, Government of
                      India, for using my data/information available with UIDAI for the purpose of Udyam Registration
                      and other official purposes in pursuance of the MSMED Act, 2006.
                    </Label>
                  </div>
                  {errors.aadhaar_consent && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.aadhaar_consent}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {!otpSent && (
                  <Button
                    onClick={handleValidateAadhaar}
                    disabled={isLoading}
                    className="w-full h-14 text-lg bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Validating...
                      </div>
                    ) : (
                      "Validate & Generate OTP"
                    )}
                  </Button>
                )}

                {otpSent && (
                  <>
                    <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800 font-medium">
                        OTP has been sent to *******{maskedMobile.slice(-4)}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                        Enter OTP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={(formData.otp as string) || ""}
                        onChange={(e) => handleInputChange("otp", e.target.value)}
                        maxLength={6}
                        className={`h-14 text-lg text-center tracking-widest border-2 rounded-xl transition-all duration-300 focus:scale-[1.02] ${
                          errors.otp
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                        }`}
                      />
                      {errors.otp && (
                        <Alert variant="destructive" className="py-3 rounded-xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errors.otp}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    Type of Organisation / संगठन के प्रकार <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => handleInputChange("organization_type", value)}
                    disabled={panValidated}
                  >
                    <SelectTrigger
                      className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 ${
                        panValidated
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                          : errors.organization_type
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm hover:scale-[1.01]"
                      }`}
                    >
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ORGANIZATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-sm py-3">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organization_type && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.organization_type}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pan_number" className="text-sm font-semibold text-gray-700">
                    PAN / पैन <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pan_number"
                    type="text"
                    placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                    value={(formData.pan_number as string) || ""}
                    onChange={(e) => handleInputChange("pan_number", e.target.value.toUpperCase())}
                    maxLength={10}
                    disabled={panValidated}
                    className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 ${
                      panValidated
                        ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                        : errors.pan_number
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm focus:scale-[1.02]"
                    }`}
                  />
                  {errors.pan_number && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.pan_number}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pan_holder_name" className="text-sm font-semibold text-gray-700">
                    Name of PAN Holder / पैन धारक का नाम <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pan_holder_name"
                    type="text"
                    placeholder="Enter name as per PAN card"
                    value={(formData.pan_holder_name as string) || ""}
                    onChange={(e) => handleInputChange("pan_holder_name", e.target.value)}
                    disabled={panValidated}
                    className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 ${
                      panValidated
                        ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                        : errors.pan_holder_name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm focus:scale-[1.02]"
                    }`}
                  />
                  {errors.pan_holder_name && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.pan_holder_name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pan_dob_or_doi" className="text-sm font-semibold text-gray-700">
                    DOB or DOI as per PAN / पैन के अनुसार जन्म तिथि या निगमन तिथि <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pan_dob_or_doi"
                    type="date"
                    value={(formData.pan_dob_or_doi as string) || ""}
                    onChange={(e) => handleInputChange("pan_dob_or_doi", e.target.value)}
                    disabled={panValidated}
                    className={`h-14 text-lg border-2 rounded-xl transition-all duration-300 ${
                      panValidated
                        ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                        : errors.pan_dob_or_doi
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm focus:scale-[1.02]"
                    }`}
                  />
                  {errors.pan_dob_or_doi && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.pan_dob_or_doi}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-inner">
                    <Checkbox
                      id="pan_consent"
                      checked={(formData.pan_consent as boolean) || false}
                      onCheckedChange={(checked) => handleInputChange("pan_consent", checked)}
                      disabled={panValidated}
                      className="mt-1 w-5 h-5"
                    />
                    <Label htmlFor="pan_consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                      I, the holder of the above PAN, hereby give my consent to Ministry of MSME, Government of India,
                      for using my data/information available in the Income Tax Returns filed by me, and also the same
                      available in the GST Returns and also from other Government organizations, for MSME classification
                      and other official purposes, in pursuance of the MSMED Act, 2006.
                    </Label>
                  </div>
                  {errors.pan_consent && (
                    <Alert variant="destructive" className="py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.pan_consent}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 h-14 px-8 text-lg border-2 rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Previous
              </Button>

              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!otpSent}
                  className="flex items-center gap-2 h-14 px-8 text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleValidatePAN}
                  disabled={isLoading || panValidated}
                  className="flex items-center gap-2 h-14 px-8 text-lg bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Validating PAN...
                    </div>
                  ) : panValidated ? (
                    "PAN Validated ✓"
                  ) : (
                    "Validate PAN"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

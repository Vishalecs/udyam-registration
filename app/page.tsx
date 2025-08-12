import { UdyamRegistrationForm } from "@/components/udyam-registration-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Udyam Registration Portal</h1>
          <p className="text-gray-600">Register your MSME business with the Government of India</p>
        </div>
        <UdyamRegistrationForm />
      </div>
    </main>
  )
}

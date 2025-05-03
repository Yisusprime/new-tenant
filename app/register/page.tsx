import { Navbar } from "@/components/layout/navbar"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <RegisterForm />
      </main>
    </div>
  )
}

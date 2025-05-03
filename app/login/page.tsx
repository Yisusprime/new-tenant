import { Navbar } from "@/components/layout/navbar"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <LoginForm redirectUrl="/" />
      </main>
    </div>
  )
}

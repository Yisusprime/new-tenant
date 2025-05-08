import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfileSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
        <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences">
          <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <p className="text-yellow-800">Las preferencias de usuario estarán disponibles próximamente.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

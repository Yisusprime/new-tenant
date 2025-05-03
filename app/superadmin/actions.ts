// Cambiar la referencia a la variable de entorno
export async function validateSuperAdminSecretKey(secretKey: string): Promise<boolean> {
  const expectedSecretKey = process.env.SUPERADMIN_SECRET_KEY || "superadmin123"
  return secretKey === expectedSecretKey
}

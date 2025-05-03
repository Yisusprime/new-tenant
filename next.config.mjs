/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  // Configuración para el tiempo de construcción
  experimental: {
    // Esto ayuda con las rutas dinámicas durante la construcción
    workerThreads: false,
    cpus: 1
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Usar exportación estática
  experimental: {
    // Esto es crucial para manejar firebase-admin correctamente
    serverComponentsExternalPackages: ['firebase-admin'],
    // Esto ayuda a evitar problemas con módulos de Node.js
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desactivar rewrites ya que no son compatibles con exportación estática
  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       // Para desarrollo local, reescribir subdominios a la ruta /tenant
  //       {
  //         source: '/:path*',
  //         has: [
  //           {
  //             type: 'host',
  //             value: '(?<subdomain>[^.]+).localhost:3000',
  //           },
  //         ],
  //         destination: '/tenant/:path*',
  //       },
  //       // Para Vercel, reescribir subdominios con formato tenant--project.vercel.app
  //       {
  //         source: '/:path*',
  //         has: [
  //           {
  //             type: 'host',
  //             value: '(?<subdomain>[^-]+)--(?<project>.+).vercel.app',
  //           },
  //         ],
  //         destination: '/tenant/:path*',
  //       },
  //     ],
  //   };
  // },
};

export default nextConfig;

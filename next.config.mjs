/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Redirigir las solicitudes de subdominios a la ruta /tenant/[tenantId]
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenantId>[^.]+).gastroo.online',
            },
          ],
          destination: '/tenant/:tenantId/:path*',
        },
      ],
    };
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

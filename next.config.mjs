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
    unoptimized: true,
  },
  // Añadir configuración para manejar módulos de Node.js en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configuración para el cliente
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        http2: false,
        dns: false,
        child_process: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
      }
      
      // Añadir polyfills
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      )
    }
    return config
  },
}

export default nextConfig

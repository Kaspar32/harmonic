import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
    ],

    domains: ["api.deezer.com"],

    localPatterns: [
      {
        pathname: '/images/**', // alle Bilder im /images Ordner
        // query erlaubt optional ?blur=1
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.xponentfunds.in',
                port: '',
                pathname: '/**', // Allow any image from this hostname
            },
        ],
    }
};

export default nextConfig;

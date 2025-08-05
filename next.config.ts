import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com']
    },
  allowedDevOrigins: ['storage.googleapis.com', 'firebasestorage.googleapis.com']
};

export default nextConfig;

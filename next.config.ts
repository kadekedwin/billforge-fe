import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
        minimumCacheTTL: 0, // Disable aggressive caching for external images
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '1mb'
        }
    }
};

export default nextConfig;

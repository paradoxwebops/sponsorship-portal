import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias["@"] = path.resolve(__dirname);
        return config;
    },
};

export default nextConfig;

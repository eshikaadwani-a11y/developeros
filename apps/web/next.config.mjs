/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Transpile workspace packages that ship raw TypeScript.
  transpilePackages: [
    "@developeros/shared",
    "@developeros/database",
    "@developeros/ai",
    "@developeros/agents",
    "@developeros/rag",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

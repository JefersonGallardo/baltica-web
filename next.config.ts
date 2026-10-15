import type { NextConfig } from "next";

// Para GitHub Pages el sitio vive en https://usuario.github.io/<repo>/
// El workflow de deploy define NEXT_PUBLIC_BASE_PATH="/<repo>".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;

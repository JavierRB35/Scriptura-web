import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Los archivos Markdown de la Biblioteca se leen desde el servidor.
  // Incluirlos explícitamente en funciones Vercel (rutas dinámicas).
  outputFileTracingIncludes: {
    "/biblioteca/*": ["./data/apocrypha/es/*.md"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

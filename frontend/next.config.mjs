/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export: every page is a client component, so Cloudflare can serve
  // the build output (`frontend/out`) as plain static files — no Node server
  // needed, which is what Cloudflare Pages/Workers static assets expect.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;

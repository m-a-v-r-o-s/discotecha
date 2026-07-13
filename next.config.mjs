/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // eslint-config-next@16 peers eslint@>=9 while the project is on eslint@8;
  // linting runs in dev, so don't let it fail the production build.
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow common external hosts used for profile photos
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'],
    // You can also use remotePatterns for more flexible matching
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    // ]
  },
};

export default nextConfig;

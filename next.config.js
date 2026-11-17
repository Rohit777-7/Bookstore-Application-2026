/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Book covers for newer titles are served by Open Library
    domains: ['covers.openlibrary.org'],
  },
}

module.exports = nextConfig

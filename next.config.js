/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable experimental features for better performance (removed problematic ones)
  experimental: {
    scrollRestoration: true,
  },
  
  // Compress images for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Academic and research indexing
          {
            key: 'X-Research-Type',
            value: 'PhD-Interactive-Art'
          },
          {
            key: 'X-Institution',
            value: 'KAIST-XD-Lab'
          },
          {
            key: 'X-Author',
            value: 'Jeanyoon-Choi'
          }
        ],
      },
      {
        source: '/pdf/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'application/pdf'
          }
        ],
      },
      {
        source: '/api/og-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/sitemap',
        destination: '/api/sitemap.xml',
        permanent: true,
      },
      {
        source: '/research',
        destination: '/',
        permanent: true,
      },
      {
        source: '/mdwa',
        destination: '/',
        permanent: true,
      }
    ];
  },
  
  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      }
    ];
  },
  
  // Enable static generation where possible
  trailingSlash: false,
  
  // Optimize for Vercel deployment
  env: {
    SITE_URL: 'https://mdwa-phd.vercel.app',
    RESEARCH_TITLE: 'MDWA: Multi-Device Web Artwork',
    AUTHOR_NAME: 'Jeanyoon Choi',
    INSTITUTION: 'KAIST XD Lab'
  }
};

module.exports = nextConfig; 
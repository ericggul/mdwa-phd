export default function handler(req, res) {
  const baseUrl = 'https://mdwa-phd.vercel.app';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" 
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Main research page -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og-image</image:loc>
      <image:title>MDWA: Multi-Device Web Artwork PhD Research</image:title>
      <image:caption>PhD research by Jeanyoon Choi on Multi-Device Web Artwork at KAIST XD Lab</image:caption>
    </image:image>
    <mobile:mobile/>
  </url>
  
  <!-- Research PDF -->
  <url>
    <loc>${baseUrl}/pdf/jeanyoon_choi_mdwa.pdf</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Open Graph Image -->
  <url>
    <loc>${baseUrl}/api/og-image</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemap);
} 
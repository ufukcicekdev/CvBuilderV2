// Public pages that should be indexed
const publicPages = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    url: '/login',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    url: '/register',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    url: '/contact',
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    url: '/pricing',
    priority: '0.9',
    changefreq: 'weekly'
  },
  {
    url: '/templates',
    priority: '0.85',
    changefreq: 'weekly'
  },
  {
    url: '/privacy-policy',
    priority: '0.6',
    changefreq: 'monthly'
  },
  {
    url: '/terms-of-service',
    priority: '0.6',
    changefreq: 'monthly'
  }
];

function generateSiteMap(hostname) {
  const today = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${publicPages
    .map(
      (page) => `
  <url>
    <loc>${hostname}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;
}

export default async function handler(req, res) {
  // Get host from request headers
  const hostname = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
  
  // Generate sitemap XML
  const sitemap = generateSiteMap(hostname);

  // Set proper content type headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 24 hours
  
  // Send the sitemap
  res.write(sitemap);
  res.end();
} 
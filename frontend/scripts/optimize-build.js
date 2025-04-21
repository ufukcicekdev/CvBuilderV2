const fs = require('fs');
const path = require('path');

/**
 * Script to run pre-deployment optimizations
 */

// Update the sitemap with current date
const updateSitemap = () => {
  console.log('Updating sitemap dates...');
  
  try {
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      let sitemap = fs.readFileSync(sitemapPath, 'utf8');
      
      // Update all lastmod dates to today
      const today = new Date().toISOString().split('T')[0] + 'T12:00:00+00:00';
      sitemap = sitemap.replace(/<lastmod>(.*?)<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
      
      fs.writeFileSync(sitemapPath, sitemap);
      console.log('Sitemap updated successfully');
    } else {
      console.log('Sitemap file not found, skipping update');
    }
  } catch (error) {
    console.error('Error updating sitemap:', error);
  }
};

// Run optimizations
const runOptimizations = async () => {
  console.log('Running build optimizations...');
  
  // Update sitemap
  updateSitemap();
  
  console.log('Build optimizations completed successfully');
};

// Execute
runOptimizations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running optimizations:', error);
    process.exit(1);
  }); 
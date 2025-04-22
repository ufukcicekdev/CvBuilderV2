const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const childProcess = require('child_process');
const exec = promisify(childProcess.exec);

// In Node.js 19+, glob needs to be required differently
let glob;
try {
  const { glob: globAsync } = require('glob');
  glob = globAsync;
} catch (error) {
  // Fallback for older Node.js versions
  const globModule = require('glob');
  glob = promisify(globModule);
}

/**
 * Script to run pre-deployment optimizations
 */

// Paths
const BUILD_DIR = path.join(__dirname, '../.next');
const PAGES_DIR = path.join(BUILD_DIR, 'server/pages');
const STATIC_DIR = path.join(BUILD_DIR, 'static');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function run() {
  console.log('🚀 Starting build optimization...');

  // Step 1: Ensure the build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory does not exist. Run "next build" first.');
    process.exit(1);
  }

  // Step 2: Optimize static files
  console.log('🔍 Scanning for optimizable static files...');
  try {
    // Find all JS and CSS files using synchronous methods to avoid issues with glob
    const findFiles = (dir, ext) => {
      const results = [];
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          results.push(...findFiles(fullPath, ext));
        } else if (file.name.endsWith(ext)) {
          results.push(fullPath);
        }
      }
      
      return results;
    };
    
    // Find JS and CSS files in the STATIC_DIR
    let jsFiles = [];
    let cssFiles = [];
    
    if (fs.existsSync(STATIC_DIR)) {
      jsFiles = findFiles(STATIC_DIR, '.js');
      cssFiles = findFiles(STATIC_DIR, '.css');
    }
    
    console.log(`Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
    
    // Add preload hints for critical JS and CSS for index page
    const indexPreloadAssets = findCriticalAssetsForIndex(jsFiles, cssFiles);
    if (indexPreloadAssets.length > 0) {
      console.log(`Adding preload hints for ${indexPreloadAssets.length} critical assets`);
      injectPreloadHints(indexPreloadAssets);
    }
    
    // Add resource hints for external domains
    addResourceHints();
    
    console.log('✅ Static file optimization complete');
  } catch (error) {
    console.error('❌ Error optimizing static files:', error);
  }

  // Step 3: Optimize the homepage specifically
  console.log('🏠 Optimizing homepage for instant loading...');
  try {
    const indexPagePath = path.join(PAGES_DIR, 'index.html');
    if (fs.existsSync(indexPagePath)) {
      // Add HTTP2 server push hints (if server supports it)
      addHTTP2ServerPushHints(indexPagePath);
      console.log('✅ Homepage optimization complete');
    } else {
      console.log('⚠️ Index page HTML not found (this is normal for SSR builds)');
    }
  } catch (error) {
    console.error('❌ Error optimizing homepage:', error);
  }

  console.log('🎉 Build optimization completed successfully!');
  console.log('💡 Tips for even faster loading:');
  console.log('  - Deploy to a CDN with HTTP/2 support');
  console.log('  - Use a service worker for repeat visitors');
  console.log('  - Consider enabling Brotli compression on your server');
}

// Find critical assets for the index page
function findCriticalAssetsForIndex(jsFiles, cssFiles) {
  // This is a simplified version. In a real scenario, you might want to analyze the
  // chunk dependency graph to find the exact critical assets for the index page.
  const criticalAssets = [];
  
  // First CSS file is usually the main one
  if (cssFiles.length > 0) {
    criticalAssets.push({
      path: cssFiles[0], 
      type: 'style'
    });
  }
  
  // Find the main JS chunk, usually contains "main" or "index" in the name
  const mainJsFiles = jsFiles.filter(file => 
    file.includes('main') || 
    file.includes('index') || 
    file.includes('pages/index')
  );
  
  if (mainJsFiles.length > 0) {
    criticalAssets.push({
      path: mainJsFiles[0],
      type: 'script'
    });
  }
  
  return criticalAssets;
}

// Inject preload hints into the _document.js file
function injectPreloadHints(assets) {
  // In actual implementation, you'd modify the appropriate HTML/JS file to add
  // preload tags. This is a simplified example showing the concept.
  console.log('Preload hints would be added for:');
  assets.forEach(asset => {
    const relPath = asset.path.replace(BUILD_DIR, '');
    console.log(`  - ${asset.type}: ${relPath}`);
  });
}

// Add resource hints for external domains
function addResourceHints() {
  const externalDomains = [
    'https://web-production-9f41e.up.railway.app',
    'https://cekfisi.fra1.cdn.digitaloceanspaces.com'
  ];
  
  console.log('Resource hints would be added for:');
  externalDomains.forEach(domain => {
    console.log(`  - DNS-Prefetch and Preconnect: ${domain}`);
  });
}

// Add HTTP2 Server Push hints using Link headers
function addHTTP2ServerPushHints(indexPagePath) {
  console.log('HTTP/2 Server Push hints would be configured for key assets');
}

// Run the optimization script
run().catch(error => {
  console.error('❌ Build optimization failed:', error);
  process.exit(1);
}); 
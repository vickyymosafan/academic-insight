/**
 * Performance Audit Script
 * Checks bundle sizes, analyzes performance, and provides recommendations
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeDirectory(dirPath, extensions = ['.js', '.css']) {
  const files = [];
  
  function traverse(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push({
          name: item,
          path: fullPath,
          size: stat.size,
          relativePath: path.relative(dirPath, fullPath)
        });
      }
    });
  }
  
  traverse(dirPath);
  return files;
}

function analyzeBundleSize() {
  log('\n' + '='.repeat(60), colors.bright);
  log('BUNDLE SIZE ANALYSIS', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const buildDir = path.join(__dirname, '..', '.next');
  
  if (!fs.existsSync(buildDir)) {
    log('Build directory not found. Run "npm run build" first.', colors.yellow);
    return;
  }

  // Analyze JavaScript bundles
  const jsFiles = analyzeDirectory(path.join(buildDir, 'static', 'chunks'), ['.js']);
  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);

  log('JavaScript Bundles:', colors.blue);
  jsFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(file => {
      const sizeStr = formatBytes(file.size);
      const color = file.size > 500000 ? colors.red : file.size > 200000 ? colors.yellow : colors.green;
      log(`  ${file.name}: ${sizeStr}`, color);
    });
  
  log(`\nTotal JS Size: ${formatBytes(totalJsSize)}`, colors.blue);

  // Analyze CSS files
  const cssFiles = analyzeDirectory(path.join(buildDir, 'static', 'css'), ['.css']);
  const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);

  if (cssFiles.length > 0) {
    log('\nCSS Files:', colors.blue);
    cssFiles.forEach(file => {
      log(`  ${file.name}: ${formatBytes(file.size)}`, colors.green);
    });
    log(`\nTotal CSS Size: ${formatBytes(totalCssSize)}`, colors.blue);
  }

  // Recommendations
  log('\n' + '='.repeat(60), colors.bright);
  log('RECOMMENDATIONS', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const recommendations = [];

  if (totalJsSize > 1000000) {
    recommendations.push({
      level: 'warning',
      message: 'Total JS bundle size exceeds 1MB. Consider code splitting.'
    });
  }

  const largeFiles = jsFiles.filter(f => f.size > 500000);
  if (largeFiles.length > 0) {
    recommendations.push({
      level: 'warning',
      message: `${largeFiles.length} file(s) exceed 500KB. Consider lazy loading or splitting.`
    });
  }

  if (recommendations.length === 0) {
    log('✓ Bundle sizes are within acceptable limits', colors.green);
  } else {
    recommendations.forEach(rec => {
      const color = rec.level === 'error' ? colors.red : colors.yellow;
      log(`⚠ ${rec.message}`, color);
    });
  }
}

function checkDependencies() {
  log('\n' + '='.repeat(60), colors.bright);
  log('DEPENDENCY ANALYSIS', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  log(`Production Dependencies: ${dependencies.length}`, colors.blue);
  log(`Development Dependencies: ${devDependencies.length}`, colors.blue);

  // Check for common heavy dependencies
  const heavyDeps = ['moment', 'lodash', 'jquery'];
  const foundHeavy = dependencies.filter(dep => heavyDeps.includes(dep));

  if (foundHeavy.length > 0) {
    log('\n⚠ Heavy dependencies detected:', colors.yellow);
    foundHeavy.forEach(dep => {
      log(`  - ${dep} (consider lighter alternatives)`, colors.yellow);
    });
  } else {
    log('\n✓ No heavy dependencies detected', colors.green);
  }
}

function analyzeImages() {
  log('\n' + '='.repeat(60), colors.bright);
  log('IMAGE ANALYSIS', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  const publicDir = path.join(__dirname, '..', 'public');
  const imageFiles = analyzeDirectory(publicDir, ['.png', '.jpg', '.jpeg', '.svg', '.webp']);

  if (imageFiles.length === 0) {
    log('No images found in public directory', colors.blue);
    return;
  }

  const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);

  log(`Total Images: ${imageFiles.length}`, colors.blue);
  log(`Total Size: ${formatBytes(totalImageSize)}`, colors.blue);

  const largeImages = imageFiles.filter(f => f.size > 100000);
  if (largeImages.length > 0) {
    log('\n⚠ Large images detected (>100KB):', colors.yellow);
    largeImages.forEach(img => {
      log(`  ${img.name}: ${formatBytes(img.size)}`, colors.yellow);
    });
    log('\nConsider optimizing these images or using WebP format.', colors.yellow);
  } else {
    log('\n✓ All images are optimized', colors.green);
  }
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    checks: [
      'Bundle Size Analysis',
      'Dependency Analysis',
      'Image Optimization'
    ],
    recommendations: []
  };

  const reportPath = path.join(__dirname, '..', 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('\n' + '='.repeat(60), colors.bright);
  log(`Performance report saved to: ${reportPath}`, colors.blue);
  log('='.repeat(60) + '\n', colors.bright);
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('PERFORMANCE AUDIT', colors.bright);
  log('Academic Insight PWA', colors.blue);
  log('='.repeat(60), colors.bright);

  analyzeBundleSize();
  checkDependencies();
  analyzeImages();
  generateReport();

  log('\n✓ Performance audit completed', colors.green);
}

main().catch(error => {
  log(`\nError: ${error.message}`, colors.red);
  process.exit(1);
});

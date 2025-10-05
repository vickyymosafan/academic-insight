/**
 * Lighthouse Performance Audit Script
 * Run Lighthouse audit and check if performance score meets requirements
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const TARGET_SCORE = 90; // Minimum performance score required

async function runLighthouse(url) {
  console.log(`🚀 Starting Lighthouse audit for: ${url}\n`);

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  };

  try {
    // Run Lighthouse
    const runnerResult = await lighthouse(url, options);

    // Extract scores
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      pwa: Math.round(lhr.categories.pwa.score * 100),
    };

    // Core Web Vitals
    const metrics = {
      fcp: lhr.audits['first-contentful-paint'].numericValue,
      lcp: lhr.audits['largest-contentful-paint'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      tbt: lhr.audits['total-blocking-time'].numericValue,
      si: lhr.audits['speed-index'].numericValue,
    };

    // Print results
    console.log('📊 Lighthouse Scores:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Performance:      ${scores.performance}/100 ${scores.performance >= TARGET_SCORE ? '✅' : '❌'}`);
    console.log(`Accessibility:    ${scores.accessibility}/100`);
    console.log(`Best Practices:   ${scores.bestPractices}/100`);
    console.log(`SEO:              ${scores.seo}/100`);
    console.log(`PWA:              ${scores.pwa}/100`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚡ Core Web Vitals:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`FCP (First Contentful Paint):    ${(metrics.fcp / 1000).toFixed(2)}s ${metrics.fcp <= 1800 ? '✅' : '❌'}`);
    console.log(`LCP (Largest Contentful Paint):  ${(metrics.lcp / 1000).toFixed(2)}s ${metrics.lcp <= 2500 ? '✅' : '❌'}`);
    console.log(`CLS (Cumulative Layout Shift):   ${metrics.cls.toFixed(3)} ${metrics.cls <= 0.1 ? '✅' : '❌'}`);
    console.log(`TBT (Total Blocking Time):       ${metrics.tbt.toFixed(0)}ms ${metrics.tbt <= 200 ? '✅' : '❌'}`);
    console.log(`SI (Speed Index):                 ${(metrics.si / 1000).toFixed(2)}s ${metrics.si <= 3400 ? '✅' : '❌'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save HTML report
    const reportPath = path.join(__dirname, '..', 'lighthouse-report.html');
    fs.writeFileSync(reportPath, runnerResult.report);
    console.log(`📄 Full report saved to: ${reportPath}\n`);

    // Check if performance meets target
    if (scores.performance < TARGET_SCORE) {
      console.error(`❌ Performance score ${scores.performance} is below target ${TARGET_SCORE}`);
      console.log('\n💡 Suggestions to improve performance:');
      
      const opportunities = lhr.audits;
      const improvements = [];
      
      if (opportunities['unused-javascript']?.score < 1) {
        improvements.push('- Remove unused JavaScript');
      }
      if (opportunities['render-blocking-resources']?.score < 1) {
        improvements.push('- Eliminate render-blocking resources');
      }
      if (opportunities['unminified-css']?.score < 1) {
        improvements.push('- Minify CSS');
      }
      if (opportunities['unminified-javascript']?.score < 1) {
        improvements.push('- Minify JavaScript');
      }
      if (opportunities['modern-image-formats']?.score < 1) {
        improvements.push('- Use modern image formats (WebP, AVIF)');
      }
      if (opportunities['uses-text-compression']?.score < 1) {
        improvements.push('- Enable text compression');
      }
      
      improvements.forEach(improvement => console.log(improvement));
      
      process.exit(1);
    } else {
      console.log(`✅ Performance score ${scores.performance} meets target ${TARGET_SCORE}!`);
    }

  } catch (error) {
    console.error('Error running Lighthouse:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

// Get URL from command line or use default
const url = process.argv[2] || 'http://localhost:3000';

runLighthouse(url).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

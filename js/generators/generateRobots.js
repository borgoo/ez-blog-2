import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generates robots.txt file
 * @param {Object} config - The build configuration object
 */
export function generateRobots(config) {
  const { robots, paths } = config;
  
  let robotsContent = `# robots.txt for ${config.blog.title}\n\n`;
  
  
  robotsContent += `User-agent: ${robots.userAgent}\n`;
  
  
  if (robots.allow && robots.allow.length > 0) {
    robots.allow.forEach(path => {
      robotsContent += `Allow: ${path}\n`;
    });
  }
  
  
  if (robots.disallow && robots.disallow.length > 0) {
    robots.disallow.forEach(path => {
      robotsContent += `Disallow: ${path}\n`;
    });
  }
  
  
  if (robots.crawlDelay) {
    robotsContent += `\n# Crawl delay (optional, prevents overwhelming your server)\n`;
    robotsContent += `Crawl-delay: ${robots.crawlDelay}\n`;
  }
  
  
  robotsContent += `\n# Sitemaps\n`;
  robotsContent += `Sitemap: ${robots.sitemapUrl}\n`;
  
  
  if (robots.disallow && robots.disallow.length === 0) {
    robotsContent += `\n# Disallow specific paths (if needed)\n`;
    robotsContent += `# Disallow: /private/\n`;
    robotsContent += `# Disallow: /admin/\n`;
  }
  
  const outputPath = join(paths.outputDir, 'robots.txt');
  writeFileSync(outputPath, robotsContent, 'utf8');
  console.log(`✓ Generated ${outputPath}`);
}


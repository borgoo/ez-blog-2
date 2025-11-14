import { writeFileSync } from 'fs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadPublishablePostsFromFile } from '../utils/postsLoader.js';

/**
 * Generates sitemap.xml file
 * @param {Object} config - The build configuration object
 */
export function generateSitemap(config) {
  const { sitemap, paths, blog } = config;
  
  
  const posts = loadPublishablePostsFromFile(paths.postsDb, readFileSync);
  
  
  const today = new Date().toISOString().split('T')[0];
  
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  
  sitemapContent += `  <url>\n`;
  sitemapContent += `    <loc>${blog.baseUrl}</loc>\n`;
  sitemapContent += `    <lastmod>${today}</lastmod>\n`;
  sitemapContent += `    <changefreq>${sitemap.homepage.changefreq}</changefreq>\n`;
  sitemapContent += `    <priority>${sitemap.homepage.priority}</priority>\n`;
  sitemapContent += `  </url>\n`;
  
  
  posts.forEach(post => {
    const postUrl = `${blog.baseUrl}posts/${post.id}.html`;
    const lastmod = post.updatedDate || post.createdDate;
    
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${postUrl}</loc>\n`;
    sitemapContent += `    <lastmod>${lastmod}</lastmod>\n`;
    sitemapContent += `    <changefreq>${sitemap.posts.changefreq}</changefreq>\n`;
    sitemapContent += `    <priority>${sitemap.posts.priority}</priority>\n`;
    sitemapContent += `  </url>\n`;
  });
  
  sitemapContent += `</urlset>\n`;
  
  const outputPath = join(paths.outputDir, 'sitemap.xml');
  writeFileSync(outputPath, sitemapContent, 'utf8');
  console.log(`✓ Generated ${outputPath} with ${posts.length} post(s)`);
}


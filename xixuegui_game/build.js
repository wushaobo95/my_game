/**
 * build.js - Build Script
 * Merge all JS files in order, generate single game.js
 */

const fs = require('fs');
const path = require('path');

// Config
const CONFIG = {
    srcDir: '.',
    distDir: 'dist',
    indexFile: 'index.html',
    outputJs: 'game.js',
    outputHtml: 'index.html',
    minify: true  // Enable minification
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// Simple JS minification using native string operations
function minifyJS(code) {
    if (!CONFIG.minify) return code;
    
    return code
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove leading/trailing whitespace from lines
        .replace(/^[\s\t]+|[\s\t]+$/gm, '')
        // Replace multiple spaces with single space
        .replace(/[ \t]{2,}/g, ' ')
        // Remove empty lines
        .replace(/\n{2,}/g, '\n')
        // Remove spaces around operators and punctuation
        .replace(/\s*([{}();,:])\s*/g, '$1')
        // Remove space before [
        .replace(/\s+\[/g, '[')
        // Trim final result
        .trim();
}

// Extract script list from index.html
function extractScripts(indexContent) {
    const scripts = [];
    const regex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = regex.exec(indexContent)) !== null) {
        const src = match[1];
        // Only process local JS files
        if (src.endsWith('.js') && !src.startsWith('http') && !src.startsWith('//')) {
            scripts.push(src);
        }
    }
    
    return scripts;
}

// Read file content
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        log(`[ERROR] Failed to read: ${filePath}`, 'red');
        log(`        ${err.message}`, 'red');
        return null;
    }
}

// Write file
function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content);
        return true;
    } catch (err) {
        log(`[ERROR] Failed to write: ${filePath}`, 'red');
        log(`        ${err.message}`, 'red');
        return false;
    }
}

// Merge JS files
function mergeScripts(scripts) {
    let combined = '';
    let totalSize = 0;
    let successCount = 0;
    
    log('\n[Merging JS files...]\n', 'blue');
    
    for (const script of scripts) {
        const fullPath = path.join(CONFIG.srcDir, script);
        const content = readFile(fullPath);
        
        if (content !== null) {
            combined += `\n/* ==================== ${script} ==================== */\n\n`;
            combined += content;
            combined += '\n\n';
            
            const size = Buffer.byteLength(content, 'utf-8');
            totalSize += size;
            successCount++;
            
            log(`[OK] ${script} (${(size / 1024).toFixed(2)} KB)`, 'green');
        }
    }
    
    return { content: combined, totalSize, successCount };
}

// Create new index.html (references merged JS)
function createDistIndex(originalContent, scripts) {
    // Remove all script tags
    let newContent = originalContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove src-based script tags (inline scripts that the above regex might have missed)
    newContent = newContent.replace(/<script[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>/gi, '');
    
    // Insert merged JS before </body>
    const scriptTag = `    <script src="${CONFIG.outputJs}"></script>`;
    newContent = newContent.replace('</body>', `${scriptTag}\n</body>`);
    
    return newContent;
}

// Copy static assets
function copyAssets() {
    log('\n[Copying static assets...]\n', 'blue');
    
    const assetsSrc = path.join(CONFIG.srcDir, 'assets');
    const assetsDist = path.join(CONFIG.distDir, 'assets');
    const cssSrc = path.join(CONFIG.srcDir, 'css');
    const cssDist = path.join(CONFIG.distDir, 'css');
    
    try {
        // Copy assets
        if (fs.existsSync(assetsSrc)) {
            copyDir(assetsSrc, assetsDist);
            log('[OK] assets/ copied', 'green');
        }
        
        // Copy css
        if (fs.existsSync(cssSrc)) {
            copyDir(cssSrc, cssDist);
            log('[OK] css/ copied', 'green');
        }
        
        return true;
    } catch (err) {
        log(`[ERROR] Copy assets failed: ${err.message}`, 'red');
        return false;
    }
}

// Recursively copy directory
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main function
function build() {
    log('\n[Starting build...]\n', 'blue');
    
    // Read index.html
    const indexPath = path.join(CONFIG.srcDir, CONFIG.indexFile);
    const indexContent = readFile(indexPath);
    
    if (!indexContent) {
        log('Build failed!', 'red');
        process.exit(1);
    }
    
    // Extract script list
    const scripts = extractScripts(indexContent);
    log(`Found ${scripts.length} JS files`, 'yellow');
    
    // Create dist directory
    const distPath = path.join(CONFIG.srcDir, CONFIG.distDir);
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Merge JS
    let { content: mergedJs, totalSize, successCount } = mergeScripts(scripts);
    
    // Minify JS
    let minifiedSize = totalSize;
    if (CONFIG.minify) {
        log('\n[Minifying JS...]', 'blue');
        mergedJs = minifyJS(mergedJs);
        minifiedSize = Buffer.byteLength(mergedJs, 'utf-8');
        log(`[OK] Minified: ${(totalSize / 1024).toFixed(2)} KB -> ${(minifiedSize / 1024).toFixed(2)} KB`, 'green');
    }
    
    // Write merged JS
    const outputJsPath = path.join(distPath, CONFIG.outputJs);
    if (!writeFile(outputJsPath, mergedJs)) {
        log('Build failed!', 'red');
        process.exit(1);
    }
    
    // Create new index.html
    const newIndex = createDistIndex(indexContent, scripts);
    const outputHtmlPath = path.join(distPath, CONFIG.outputHtml);
    if (!writeFile(outputHtmlPath, newIndex)) {
        log('Build failed!', 'red');
        process.exit(1);
    }
    
    // Copy static assets
    if (!copyAssets()) {
        log('Build failed!', 'red');
        process.exit(1);
    }
    
    // Print statistics
    log('\n' + '='.repeat(50), 'blue');
    log('Build successful!', 'green');
    log('='.repeat(50), 'blue');
    log(`Output dir: ${CONFIG.distDir}/`, 'yellow');
    log(`JS file: ${CONFIG.outputJs}`, 'yellow');
    log(`Original files: ${scripts.length}`, 'yellow');
    log(`Merged: ${successCount}`, 'green');
    if (CONFIG.minify && minifiedSize < totalSize) {
        const savings = ((totalSize - minifiedSize) / totalSize * 100).toFixed(1);
        log(`Original size: ${(totalSize / 1024).toFixed(2)} KB`, 'yellow');
        log(`Minified size: ${(minifiedSize / 1024).toFixed(2)} KB (${savings}% saved)`, 'green');
    } else {
        log(`Output size: ${(minifiedSize / 1024).toFixed(2)} KB`, 'yellow');
    }
    log(`Reduced requests: ${scripts.length - 1}`, 'green');
    log('='.repeat(50) + '\n', 'blue');
}

// Run build
build();

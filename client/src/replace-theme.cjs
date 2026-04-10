const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'components', 'landing');
const pagesPath = path.join(__dirname, 'pages');
const indexStylePath = path.join(__dirname, 'index.css');

const replacements = {
  // Backgrounds
  '#0a0f0d': '#FDFBF7', // Main bg
  '#111a15': '#FFFFFF', // Card bg
  '#192319': '#F4F1EA', // Elevated bg
  
  // Borders
  '#243124': '#E5E2D9', // Subtle border
  '#2e4030': '#D1CFC2', // Hover border
  '#1a2a1f': '#E5E2D9', // WhyUs specific border
  '#0d150f': '#FFFFFF', // WhyUs specific dark
  
  // Text
  '#e8f5ec': '#0A2518', // Body text
  'text-white': 'text-[#0A2518]', // Global text
  '#6b8f76': '#4D6357', // Muted text
  '#4a6b55': '#4D6357', // WhyUs specific muted
  '#3d5945': '#728279', // Dimmer text
  '#2d4a36': '#728279', // WhyUs specific dimmer
  'text-[var(--text-primary)]': 'text-[#0A2518]',

  // Accents
  '#4ade80': '#047857', // Primary Accent (Premium Emerald)
  '#86efac': '#065F46', // Primary Accent Hover
};

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Manual fixes for specific white usages in light theme
  // We want ghost buttons that were white/10 to be dark/10
  content = content.replace(/border-white\/10/g, 'border-[#0A2518]/10');
  content = content.replace(/border-white\/5/g, 'border-[#0A2518]/5');
  content = content.replace(/border-white\/20/g, 'border-[#0A2518]/20');
  content = content.replace(/bg-white\/5/g, 'bg-[#0A2518]/5');
  content = content.replace(/bg-white\/10/g, 'bg-[#0A2518]/10');
  content = content.replace(/bg-white\/20/g, 'bg-[#0A2518]/20');
  content = content.replace(/text-white\/5/g, 'text-[#0A2518]/5');

  // Replace colors
  for (const [oldColor, newColor] of Object.entries(replacements)) {
    content = content.replaceAll(oldColor, newColor);
  }

  // Reverse any double replacements or issues:
  // Since we replaced text-white with text-[#0A2518], we don't need text-[#0A2518]/10 if it was text-white/10, wait we already handled that.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

// Run replacements
console.log('Starting color replacements...');
processDirectory(directoryPath);
processDirectory(pagesPath);
processFile(indexStylePath);
console.log('Done!');

const fs = require('fs');
const path = require('path');

const filePaths = [
  'src/app/page.tsx',
  'src/app/audience/page.tsx',
  'src/app/campaign/page.tsx',
  'src/app/analytics/page.tsx',
  'src/components/Navigation.tsx',
  'src/app/layout.tsx'
];

filePaths.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/bg-\[\#f4f0eb\]/g, 'bg-[var(--retro-bg)]');
  content = content.replace(/bg-white/g, 'bg-[var(--retro-panel)]');
  content = content.replace(/border-black/g, 'border-[var(--retro-border)]');
  content = content.replace(/text-black/g, 'text-[var(--retro-text)]');
  content = content.replace(/text-slate-500/g, 'text-[var(--retro-text-muted)]');
  content = content.replace(/bg-slate-200/g, 'bg-[var(--retro-header)]');
  content = content.replace(/divide-black/g, 'divide-[var(--retro-border)]');
  content = content.replace(/border-white/g, 'border-[var(--retro-panel)]');
  
  // Specific Recharts color in analytics
  content = content.replace(/color: '#000000'/g, "color: 'var(--retro-border)'");
  
  // Shadows
  content = content.replace(/rgba\(0,0,0,1\)/g, 'var(--retro-border)');
  
  fs.writeFileSync(filePath, content);
});

console.log('Replaced colors in TSX files successfully.');

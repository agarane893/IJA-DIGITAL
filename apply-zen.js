const fs = require('fs');
const path = require('path');

const replacements = [
  // Admin Dark Backgrounds
  { regex: /bg-\[\#0D1117\]/g, replacement: 'bg-zen-900' },
  { regex: /bg-\[\#161B22\]/g, replacement: 'bg-zen-800' },
  
  // Accents (Orange to Matcha)
  { regex: /text-\[\#D95D39\]/g, replacement: 'text-zen-500' },
  { regex: /bg-\[\#D95D39\]/g, replacement: 'bg-zen-500' },
  { regex: /border-\[\#D95D39\]/g, replacement: 'border-zen-500' },
  { regex: /from-\[\#D95D39\]/g, replacement: 'from-zen-500' },
  { regex: /to-\[\#E68867\]/g, replacement: 'to-zen-400' },
  { regex: /shadow-\[\#D95D39\]/g, replacement: 'shadow-zen-500' },
  { regex: /ring-\[\#D95D39\]/g, replacement: 'ring-zen-500' },
  
  // Client Light Backgrounds
  { regex: /bg-\[\#FDF6E9\]/g, replacement: 'bg-zen-50' },
  { regex: /from-\[\#FDF6E9\]/g, replacement: 'from-zen-50' },
  { regex: /bg-\[\#F3DEC2\]/g, replacement: 'bg-zen-100' },
  { regex: /to-\[\#F3DEC2\]/g, replacement: 'to-zen-100' },
  
  // Client Borders
  { regex: /border-\[\#EADCB9\]/g, replacement: 'border-zen-200' },
  
  // Client Text (Dark Blue to Dark Forest)
  { regex: /text-\[\#131924\]/g, replacement: 'text-zen-900' },
  { regex: /bg-\[\#131924\]/g, replacement: 'bg-zen-900' },
  { regex: /border-\[\#131924\]/g, replacement: 'border-zen-900' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'app'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('Done replacing colors.');

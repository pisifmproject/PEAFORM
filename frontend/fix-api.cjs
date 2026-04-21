const fs = require('fs');
const path = require('path');

const directoryPaths = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if we need to add the import
  const needsImport = content.includes("fetch('/api/") || content.includes('fetch("/api/') || content.includes('fetch(`/api/');
  
  if (needsImport) {
    if (!content.includes('API_BASE_URL')) {
      const inPages = filePath.includes('pages\\') || filePath.includes('pages/');
      const inComponents = filePath.includes('components\\') || filePath.includes('components/');
      const relativePath = (inPages || inComponents) ? '../lib/api' : './lib/api';
      
      content = `import { API_BASE_URL } from '${relativePath}';\n` + content;
    }

    // Replace fetch('/api/foo', ...) string literal fetch with template literal fetch
    content = content.replace(/fetch\('\/api\/([^']*)'/g, "fetch(`${API_BASE_URL}/api/$1`");
    content = content.replace(/fetch\("\/api\/([^"]*)"/g, "fetch(`${API_BASE_URL}/api/$1`");
    
    // Replace fetch(`/api/foo`, ...) template literal start
    content = content.replace(/fetch\(\`\/api\//g, "fetch(`${API_BASE_URL}/api/");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

directoryPaths.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(dir, file));
    }
  });
});

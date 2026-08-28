const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const filePath = path.join(__dirname, 'src', 'pages', 'Home', 'index.jsx');
const code = fs.readFileSync(filePath, 'utf8');
console.log('filePath:', filePath);
console.log('length:', code.length);
console.log('lines:', code.split(/\r?\n/).length);
console.log('tail:', JSON.stringify(code.slice(-200)));
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('PARSE_OK');
} catch (e) {
  console.error('PARSE_ERROR:', e.message);
}

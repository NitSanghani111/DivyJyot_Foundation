const fs = require('fs');
const path = require('path');

function searchFile(filePath, query) {
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let found = false;
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`${path.basename(filePath)}:${index + 1}: ${line.trim()}`);
      found = true;
    }
  });
  if (!found) {
    console.log(`Query "${query}" not found in ${path.basename(filePath)}`);
  }
}

searchFile('c:\\Users\\nit05\\Downloads\\Archive\\css\\style.css', 'footer');
searchFile('c:\\Users\\nit05\\Downloads\\Archive\\css\\custom.css', 'footer');

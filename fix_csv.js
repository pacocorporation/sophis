const fs = require('fs');
const file = 'c:/Users/pacoc/Downloads/SITE/sophis-cloud/sophis/public/inventario.csv';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/^"(.+)"\s*$/gm, (m, p1) => {
    return p1.replace(/""/g, '"');
});
fs.writeFileSync(file, content);
console.log('Fixed CSV');

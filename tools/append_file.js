const fs = require('fs');
const path = require('path');
const [, , target, b64] = process.argv;
if (!target || !b64) {
    console.error('Usage: node append_file.js <target> <base64>');
    process.exit(1);
}
const fullPath = path.resolve(target);
const content = Buffer.from(b64, 'base64').toString('utf8');
fs.appendFileSync(fullPath, content, 'utf8');
console.log('Successfully appended ' + content.length + ' chars to ' + target);

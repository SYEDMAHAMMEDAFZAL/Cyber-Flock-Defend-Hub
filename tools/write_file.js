const fs = require('fs');
const path = require('path');
const [, , target, b64] = process.argv;
if (!target || !b64) {
    console.error('Usage: node write_file.js <target> <base64>');
    process.exit(1);
}
const fullPath = path.resolve(target);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });
const content = Buffer.from(b64, 'base64').toString('utf8');
fs.writeFileSync(fullPath, content, 'utf8');
console.log('Successfully wrote ' + content.length + ' chars to ' + target);

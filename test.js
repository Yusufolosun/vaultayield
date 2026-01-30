const { readFileSync } = require('fs');
console.log("Testing Node JS...");
const content = readFileSync('test.ts', 'utf-8');
console.log("File content length:", content.length);

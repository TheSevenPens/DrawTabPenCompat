const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const xml = fs.readFileSync('wacom-pen-compat.xml', 'utf8');
const dom = new JSDOM(xml, { contentType: "text/xml" });
const doc = dom.window.document;

// Count Definitions
const tabletDefs = new Set();
const duplicateDefs = [];
doc.querySelectorAll('tabletdef').forEach(def => {
    const id = def.getAttribute('id');
    if (tabletDefs.has(id)) duplicateDefs.push(id);
    tabletDefs.add(id);
});

// Count Usages
const usedTablets = new Set();
doc.querySelectorAll('compatrow tablet').forEach(node => {
    const text = node.textContent || '';
    const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
    items.forEach(item => usedTablets.add(item));
});

console.log(`Definitions count: ${tabletDefs.size}`);
console.log(`Duplicate Definitions: ${duplicateDefs.join(', ')}`);
console.log(`Usage count: ${usedTablets.size}`);

const undefinedTablets = [...usedTablets].filter(t => !tabletDefs.has(t));
console.log(`Tablets used but not defined (${undefinedTablets.length}):`);
console.log(undefinedTablets.join(', '));

const unusedTablets = [...tabletDefs].filter(t => !usedTablets.has(t));
console.log(`Tablets defined but not used (${unusedTablets.length}):`);
console.log(unusedTablets.join(', '));

const fs = require('fs');
const path = require('path');

let knowledgeCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;

  const dir = path.join(__dirname, '..', 'knowledge');

  if (!fs.existsSync(dir)) {
    knowledgeCache = '';
    return knowledgeCache;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  knowledgeCache = files
    .map(f => fs.readFileSync(path.join(dir, f), 'utf-8'))
    .join('\n\n---\n\n');

  console.log(`Knowledge base loaded: ${files.length} file(s)`);
  return knowledgeCache;
}

module.exports = { loadKnowledge };

try {
const fs = require('fs');
const path = require('path');
const { split } = require('sentence-splitter');

// Paths to the corpus folders
const baseDir = path.join(__dirname, 'onestop_corpus', 'OneStopEnglishCorpus-master', 'Texts-SeparatedByReadingLevel');
const levels = {
  Easy: 'Ele-Txt',
  Medium: 'Int-Txt',
  Hard: 'Adv-Txt',
};

function getAllFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
}

function extractSentences(text) {
  // Use sentence-splitter to split into sentences
  return split(text)
    .filter(token => token.type === 'Sentence')
    .map(token => token.raw.trim())
    .filter(s => s.length > 10); // filter out very short sentences
}

function processLevel(levelName, folder, includeParagraphs = false) {
  const dir = path.join(baseDir, folder);
  const files = getAllFiles(dir);
  let sentences = new Set();
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Split by double newlines to get paragraphs
    const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (includeParagraphs) {
      for (const para of paragraphs) {
        if (para.length > 20) sentences.add(para);
        extractSentences(para).forEach(s => sentences.add(s));
      }
    } else {
      for (const para of paragraphs) {
        extractSentences(para).forEach(s => sentences.add(s));
      }
    }
  }
  return Array.from(sentences);
}

const result = {
  Easy: processLevel('Easy', levels.Easy),
  Medium: processLevel('Medium', levels.Medium),
  Hard: processLevel('Hard', levels.Hard, true),
};

// Output file
const outPath = path.join(__dirname, 'src', 'data', 'onestop_speaking_sentences.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('Done! Output written to', outPath);

} catch (err) {
  console.error('Error:', err);
} 
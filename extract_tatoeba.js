const fs = require('fs');
const readline = require('readline');

const INPUT_FILE = './tatoeba_data/sentences.csv';
const OUTPUT_FILE = './tatoeba_data/tatoeba_english_sentences.json';

// Settings: adjust as needed
const MIN_WORDS = 3;
const MAX_WORDS = 12;
const MAX_SENTENCES = 1000; // Limit for demo/testing

const rl = readline.createInterface({
  input: fs.createReadStream(INPUT_FILE),
  crlfDelay: Infinity
});

const results = [];
rl.on('line', (line) => {
  const [id, lang, text] = line.split('\t');
  if (lang === 'eng') {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= MIN_WORDS && wordCount <= MAX_WORDS) {
      results.push(text.trim());
      if (results.length >= MAX_SENTENCES) rl.close();
    }
  }
});

rl.on('close', () => {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Extracted ${results.length} English sentences to ${OUTPUT_FILE}`);
}); 
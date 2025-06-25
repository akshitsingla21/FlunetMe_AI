// Node.js script to auto-generate reading questions from OneStopEnglish Corpus
const fs = require('fs');
const path = require('path');

// Folders for each level
const LEVELS = [
  { level: 'Adv', dir: 'onestop_corpus/OneStopEnglishCorpus-master/Texts-SeparatedByReadingLevel/Adv-Txt' },
  { level: 'Int', dir: 'onestop_corpus/OneStopEnglishCorpus-master/Texts-SeparatedByReadingLevel/Int-Txt' },
  { level: 'Ele', dir: 'onestop_corpus/OneStopEnglishCorpus-master/Texts-SeparatedByReadingLevel/Ele-Txt' },
];

// Simple stopword list
const STOPWORDS = new Set([
  'the','is','in','at','of','a','an','and','to','it','on','for','with','as','by','that','this','from','be','or','are','was','were','but','not','have','has','had','they','you','he','she','we','i','his','her','their','our','your','its','which','will','would','can','could','should','do','does','did','so','if','then','than','about','into','out','up','down','over','under','again','further','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','only','own','same','too','very','s','t','just','don','now'
]);

// Helper: pick a random element from array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: pick multiple random elements from array
function pickMultipleRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper: split text into sentences (simple)
function splitSentences(text) {
  return text.match(/[^.!?\n]+[.!?\n]+/g) || [];
}

// Helper: split sentence into words
function splitWords(sentence) {
  return sentence.match(/\b\w+\b/g) || [];
}

// Helper: generate a single question from a sentence
function generateQuestion(sentence) {
  const words = splitWords(sentence);
  const candidates = words.filter(w => !STOPWORDS.has(w.toLowerCase()) && w.length > 2);
  
  if (candidates.length === 0) return null;
  
  const answer = pickRandom(candidates);
  const question = sentence.replace(new RegExp(`\\b${answer}\\b`), '____');
  
  return { question, answer, sentence };
}

// Helper: generate multiple unique questions from a passage
function generateQuestions(passage, count = 3) {
  const sentences = splitSentences(passage);
  if (sentences.length < count) return null;
  
  // Pick random sentences for questions
  const selectedSentences = pickMultipleRandom(sentences, count * 2); // Get extra sentences in case some fail
  const questions = [];
  
  for (const sentence of selectedSentences) {
    if (questions.length >= count) break;
    
    const question = generateQuestion(sentence.trim());
    if (question) {
      // Check if we already have a question with this answer
      const isDuplicate = questions.some(q => 
        q.answer.toLowerCase() === question.answer.toLowerCase() ||
        q.sentence === question.sentence
      );
      
      if (!isDuplicate) {
        questions.push(question);
      }
    }
  }
  
  return questions.length >= count ? questions : null;
}

// Main
async function main() {
  const output = [];

  for (const { level, dir } of LEVELS) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
    for (const file of files) {
      const title = path.basename(file, '.txt');
      const passage = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n').trim();
      
      const questions = generateQuestions(passage);
      if (questions) {
        output.push({
          title,
          level,
          passage,
          questions
        });
      }
    }
  }

  // Ensure output directory exists
  const outDir = path.join('src', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'onestop_reading_questions.json'), JSON.stringify(output, null, 2), 'utf8');
  console.log(`Generated ${output.length} reading passages with ${output.length * 3} questions total.`);
}

main(); 
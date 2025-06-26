import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpeakingPractice.css';
import { useUserData } from '../context/UserDataContext';
import { FaVolumeUp, FaMicrophone, FaStopCircle } from 'react-icons/fa';

// Default sentences in case JSON fails to load
const DEFAULT_SENTENCES = {
  'Easy': [
    'Hello, how are you today?',
    'I like to read books.',
    'The weather is nice.'
  ],
  'Medium': [
    'I enjoy learning new things every day.',
    'The movie we watched last night was interesting.',
    'Could you please help me with this task?'
  ],
  'Hard': [
    'The implementation of artificial intelligence in modern technology has revolutionized our daily lives.',
    'Environmental conservation should be a priority for sustainable development.',
    'The complexity of human relationships makes them both challenging and rewarding.'
  ]
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = true;
}

// Normalize text for comparison
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, '') // Remove all non-alphanumeric characters except spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Compare words and return similarity score
function compareWords(word1, word2) {
  word1 = word1.toLowerCase();
  word2 = word2.toLowerCase();
  
  if (word1 === word2) return 1;
  
  // Calculate letter-based similarity for close matches
  const longer = word1.length > word2.length ? word1 : word2;
  const shorter = word1.length > word2.length ? word2 : word1;
  
  if (longer.includes(shorter)) return 0.9;
  
  let matches = 0;
  const minLength = Math.min(word1.length, word2.length);
  for (let i = 0; i < minLength; i++) {
    if (word1[i] === word2[i]) matches++;
  }
  return matches / longer.length;
}

// Add a simple diff function for word alignment
function diffWords(target, attempt) {
  const targetWords = target.split(' ');
  const attemptWords = attempt.split(' ');
  const result = [];
  let i = 0, j = 0;
  while (i < targetWords.length || j < attemptWords.length) {
    if (i < targetWords.length && j < attemptWords.length) {
      if (targetWords[i] === attemptWords[j]) {
        result.push({ word: targetWords[i], type: 'correct' });
        i++; j++;
      } else if (attemptWords[j + 1] === targetWords[i]) {
        result.push({ word: attemptWords[j], type: 'extra' });
        j++;
      } else if (targetWords[i + 1] === attemptWords[j]) {
        result.push({ word: targetWords[i], type: 'missing' });
        i++;
      } else {
        result.push({ word: attemptWords[j], type: 'incorrect', target: targetWords[i] });
        i++; j++;
      }
    } else if (i < targetWords.length) {
      result.push({ word: targetWords[i], type: 'missing' });
      i++;
    } else if (j < attemptWords.length) {
      result.push({ word: attemptWords[j], type: 'extra' });
      j++;
    }
  }
  return result;
}

const SpeakingPractice = () => {
  const navigate = useNavigate();
  console.log('SpeakingPractice render');
  const { addScore } = useUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [currentSentence, setCurrentSentence] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [score, setScore] = useState(null);
  const [wordComparison, setWordComparison] = useState([]);
  const [sentencesByCategory, setSentencesByCategory] = useState(null);
  const [isReattempt, setIsReattempt] = useState(false);

  // Load sentences
  useEffect(() => {
    const loadSentences = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/data/onestop_speaking_sentences.json');
        if (!response.ok) throw new Error('Failed to load sentences');
        const data = await response.json();
        setSentencesByCategory(data);
      } catch (err) {
        console.error('Error loading sentences:', err);
        setError('Failed to load sentences. Using default set.');
        setSentencesByCategory(DEFAULT_SENTENCES);
      } finally {
        setLoading(false);
      }
    };

    loadSentences();
  }, []);

  const selectNewSentence = useCallback(() => {
    if (!sentencesByCategory) return;

    const sentences = sentencesByCategory[difficulty] || DEFAULT_SENTENCES[difficulty];
    if (!sentences || sentences.length === 0) {
      setCurrentSentence("No sentences available for this difficulty level.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
    setScore(null);
    setFullTranscript('');
    setWordComparison([]);
    setIsReattempt(false);
  }, [difficulty, sentencesByCategory]);

  useEffect(() => {
    if (!loading && sentencesByCategory) {
      selectNewSentence();
    }
  }, [loading, sentencesByCategory, selectNewSentence]);

  const compareSentences = useCallback((transcript) => {
    console.log('compareSentences called');
    console.log('fullTranscript:', transcript);
    console.log('currentSentence:', currentSentence);
    if (!transcript || !currentSentence) {
      setScore(0);
      setWordComparison([]);
      return;
    }
    const normalizedTarget = normalizeText(currentSentence);
    const normalizedAttempt = normalizeText(transcript);
    // Debug log
    console.log('Target:', normalizedTarget);
    console.log('Attempt:', normalizedAttempt);
    if (normalizedTarget === normalizedAttempt) {
      setScore(100);
      setWordComparison(normalizedTarget.split(' ').map(word => ({ word, type: 'correct' })));
      addScore('speaking', 50); // Bonus for perfect match
      return;
    }
    // Use diffWords for visual feedback
    const diff = diffWords(normalizedTarget, normalizedAttempt);
    // Score: percent correct words (not missing/extra/incorrect)
    const correctCount = diff.filter(w => w.type === 'correct').length;
    const total = normalizedTarget.split(' ').length;
    const totalScore = Math.round((correctCount / total) * 100);
    setWordComparison(diff);
    setScore(totalScore);
    if (totalScore > 70) {
      addScore('speaking', totalScore - 50);
    }
  }, [currentSentence, addScore]);

  const startRecording = () => {
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser. Please try Chrome or Edge.');
      return;
    }
    if (!isReattempt) {
      setFullTranscript('');
    }
    setInterimTranscript('');
    setScore(null);
    setWordComparison([]);
    setError(null);
    setIsRecording(true);
    setIsReattempt(true);
    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setFullTranscript(final);
        finalTranscript = final;
      }
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setInterimTranscript('');
      setError(`Speech recognition error: ${event.error}`);
    };
    try {
      recognition.start();
    } catch (error) {
      console.error('Speech recognition start error:', error);
      setIsRecording(false);
      setInterimTranscript('');
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setInterimTranscript('');
    setTimeout(() => {
      compareSentences(fullTranscript);
    }, 100);
  };

  const listenToSentence = () => {
    if (!currentSentence) return;
    const utterance = new SpeechSynthesisUtterance(currentSentence);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="speaking-practice-container">
        <h2>Speaking Practice</h2>
        <p>Loading sentences...</p>
      </div>
    );
  }

  if (!SpeechRecognition) {
    return (
      <div className="speaking-practice-container">
        <h2>Speaking Practice</h2>
        <p className="error-message">
          Your browser does not support the Web Speech API. Please try Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="speaking-practice-container">
      <button className="back-button" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2>Speaking Practice</h2>
      {error && <p className="error-message">{error}</p>}
      
      <div className="difficulty-selector">
        <label>Difficulty: </label>
        <div className="difficulty-buttons">
          {['Easy', 'Medium', 'Hard'].map((level) => (
            <button
              key={level}
              className={`difficulty-btn${difficulty === level ? ' selected' : ''}`}
              onClick={() => {
                setDifficulty(level);
                setScore(null);
                setFullTranscript('');
                setWordComparison([]);
                selectNewSentence();
              }}
              disabled={difficulty === level}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="sentence-card">
        <div className="sentence-audio-row">
          <p className="target-sentence">{currentSentence}</p>
          <button 
            onClick={listenToSentence} 
            className="listen-button" 
            aria-label="Listen to sentence"
            disabled={!currentSentence}
          >
            <FaVolumeUp />
          </button>
        </div>
      </div>

      <div className="controls">
        {!isRecording ? (
          <button 
            onClick={startRecording} 
            className="control-button record"
            disabled={!currentSentence}
          >
            <FaMicrophone /> Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="control-button stop">
            <FaStopCircle /> Stop Recording
          </button>
        )}
      </div>

      <div className="transcript-section">
        {isRecording && interimTranscript && (
          <div className="interim-transcript">
            <p>{interimTranscript}</p>
          </div>
        )}
        {fullTranscript && (
          <>
            <h3>Your attempt:</h3>
            <p>{fullTranscript}</p>
          </>
        )}
      </div>

      {score !== null && (
        <div className="score-section">
          <h3>Your score: {score}%</h3>
          {wordComparison.length > 0 && (
            <div className="word-comparison">
              {wordComparison.map((item, index) => (
                <span
                  key={index}
                  className={`word word-${item.type}`}
                  title={item.type === 'incorrect' && item.target ? `Expected: ${item.target}` : undefined}
                >
                  {item.word}
                </span>
              ))}
            </div>
          )}
          <div className="legend">
            <span className="word word-correct">Correct</span>
            <span className="word word-incorrect">Incorrect</span>
            <span className="word word-missing">Missing</span>
            <span className="word word-extra">Extra</span>
          </div>
          <button onClick={selectNewSentence} className="next-button">
            Next Sentence
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeakingPractice;
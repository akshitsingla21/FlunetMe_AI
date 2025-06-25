import React, { useState, useEffect } from 'react';
import { useUserData } from '../context/UserDataContext';
import { useNavigate } from 'react-router-dom';
import './ReadingPractice.css';

const LEVEL_LABELS = {
  Ele: 'Easy',
  Int: 'Medium',
  Adv: 'Hard',
};

const ReadingPractice = () => {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [isReattempt, setIsReattempt] = useState(false);
  const { addScore } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/data/onestop_reading_questions.json')
      .then(res => res.json())
      .then(data => {
        setPassages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading passages:', error);
        setPassages([]);
        setLoading(false);
      });
  }, []);

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    setSelectedPassage(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setIsReattempt(false);
  };

  const handleSelectPassage = (passage) => {
    setSelectedPassage(passage);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setIsReattempt(false);
  };

  const handleGoBack = () => {
    setSelectedPassage(null);
  };

  const handleOptionChange = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedPassage.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalScore = calculateScore();
      if (!isReattempt) {
        addScore('reading', finalScore);
      }
      setShowScore(finalScore);
    }
  };

  const handleReattempt = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setIsReattempt(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    selectedPassage.questions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index]?.trim().toLowerCase();
      const correctAnswer = q.answer.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / selectedPassage.questions.length) * 100);
  };

  const renderQuestion = (q, index) => {
    // Only fill-in-the-blank supported for now
    return (
      <div className="fill-in-the-blank">
        <input
          type="text"
          value={selectedAnswers[index] || ''}
          onChange={(e) => handleOptionChange(e.target.value)}
          className="blank-input"
          autoFocus
        />
      </div>
    );
  };

  // View 1: Level Selection
  if (!selectedLevel) {
    return (
      <div className="reading-practice level-selection">
        <h2>Select Difficulty Level</h2>
        {loading ? (
          <p>Loading passages...</p>
        ) : (
          <>
            <div className="level-buttons">
              {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                const count = passages.filter(p => p.level === level).length;
                return (
                  <button 
                    key={level} 
                    onClick={() => handleSelectLevel(level)}
                    disabled={count === 0}
                    className={count === 0 ? 'disabled' : ''}
                  >
                    {label}
                    <span className="passage-count">({count} passages)</span>
                  </button>
                );
              })}
            </div>
            {passages.length === 0 && (
              <p className="error-message">No passages available. Please try again later.</p>
            )}
          </>
        )}
      </div>
    );
  }

  // View 2: Passage Selection
  if (!selectedPassage) {
    const filteredPassages = passages.filter(p => p.level === selectedLevel);
    return (
      <div className="reading-practice passage-selection">
        <div className="header-section">
          <button onClick={() => setSelectedLevel(null)} className="back-button">
            ← Back to Levels
          </button>
          <h2>Choose a Story to Read ({LEVEL_LABELS[selectedLevel]})</h2>
        </div>
        <div className="passage-list">
          {loading ? (
            <p>Loading passages...</p>
          ) : filteredPassages.length === 0 ? (
            <div className="no-passages">
              <p>No passages available for this level.</p>
              <button onClick={() => setSelectedLevel(null)} className="try-another">
                Try Another Level
              </button>
            </div>
          ) : (
            filteredPassages.map((passage, idx) => (
              <div key={passage.title + idx} className="passage-card" onClick={() => handleSelectPassage(passage)}>
                <h3>{passage.title}</h3>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // View 3: Score Page
  if (showScore !== false) {
    return (
      <div className="reading-practice score-page">
        <h2>Quiz Finished for "{selectedPassage.title}"!</h2>
        <h3>Your Score: {showScore}%</h3>
        <button onClick={handleReattempt}>Re-attempt Quiz</button>
        <button onClick={handleGoBack} className="back-button">Choose Another Story</button>
        <p className="disclaimer">Scores from re-attempts will not be saved to your profile.</p>
      </div>
    );
  }

  // View 4: Quiz Page
  const currentQuestion = selectedPassage.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === selectedPassage.questions.length - 1;

  return (
    <div className="reading-practice-container">
      <button className="back-button" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="reading-practice">
        <button onClick={handleGoBack} className="back-to-stories-btn">← Back to Stories</button>
        <h2>{selectedPassage.title}</h2>
        <p className="passage">{selectedPassage.passage}</p>
        <div className="questions-container">
          <div className="question-block">
            <p className="question">{currentQuestionIndex + 1}. {currentQuestion.question.replace('____', '______')}</p>
            {renderQuestion(currentQuestion, currentQuestionIndex)}
          </div>
        </div>
        <button 
          onClick={handleNextQuestion} 
          disabled={selectedAnswers[currentQuestionIndex] === undefined || selectedAnswers[currentQuestionIndex] === ''}
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default ReadingPractice; 
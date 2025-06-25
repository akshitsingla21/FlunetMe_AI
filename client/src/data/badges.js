import { FaTrophy, FaStar, FaMedal, FaBrain } from 'react-icons/fa';

export const badgeDefs = {
  PERFECT_SCORE: {
    id: 'PERFECT_SCORE',
    title: 'Perfectionist',
    description: 'Achieve a perfect 100% score on any quiz.',
    icon: FaStar,
  },
  FIRST_100_POINTS: {
    id: 'FIRST_100_POINTS',
    title: 'Point Collector',
    description: 'Earn your first 100 points.',
    icon: FaMedal,
  },
  LEVEL_3: {
    id: 'LEVEL_3',
    title: 'Leveling Up',
    description: 'Reach Level 3.',
    icon: FaTrophy,
  },
  PRACTICE_GURU: {
    id: 'PRACTICE_GURU',
    title: 'Practice Guru',
    description: 'Complete both a speaking and a reading practice.',
    icon: FaBrain,
  }
};

// A function to check which badges have been earned
export const checkBadges = (scores, points, level) => {
  const earnedBadges = new Set();

  // Check for perfect score
  if (scores.speaking.some(s => s.score === 100) || scores.reading.some(s => s.score === 100)) {
    earnedBadges.add(badgeDefs.PERFECT_SCORE.id);
  }

  // Check for first 100 points
  if (points >= 100) {
    earnedBadges.add(badgeDefs.FIRST_100_POINTS.id);
  }

  // Check for reaching level 3
  if (level >= 3) {
    earnedBadges.add(badgeDefs.LEVEL_3.id);
  }

  // Check for completing both practice types
  if (scores.speaking.length > 0 && scores.reading.length > 0) {
    earnedBadges.add(badgeDefs.PRACTICE_GURU.id);
  }

  return Array.from(earnedBadges);
}; 
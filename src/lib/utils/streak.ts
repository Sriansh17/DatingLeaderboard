import { startOfDay, differenceInCalendarDays } from 'date-fns';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  message: string;
}

export function calculateStreak(postDates: string[]): StreakResult {
  if (postDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActive: false, message: 'Start your streak!' };
  }

  // Get unique dates (only count one post per day)
  const seen = new Set<string>();
  const uniqueDates: Date[] = [];
  for (const d of postDates) {
    const key = startOfDay(new Date(d)).toISOString();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDates.push(new Date(d));
    }
  }
  uniqueDates.sort((a, b) => b.getTime() - a.getTime()); // newest first

  const today = startOfDay(new Date());

  const newestDate = startOfDay(uniqueDates[0]);

  // Check if streak is active (posted today or yesterday)
  const diffToday = differenceInCalendarDays(today, newestDate);
  const isActive = diffToday === 0 || diffToday === 1;

  // Calculate current streak
  let currentStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = startOfDay(uniqueDates[i - 1]);
    const currDate = startOfDay(uniqueDates[i]);
    const diff = differenceInCalendarDays(prevDate, currDate);

    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // If not active (last post was more than yesterday), reset streak
  if (!isActive) {
    currentStreak = 0;
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = startOfDay(uniqueDates[i - 1]);
    const currDate = startOfDay(uniqueDates[i]);
    const diff = differenceInCalendarDays(prevDate, currDate);

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  let message: string;
  if (currentStreak === 0) {
    message = 'Start your streak today! 🔥';
  } else if (currentStreak < 3) {
    message = `${currentStreak}-day streak! 🔥`;
  } else if (currentStreak < 7) {
    message = `${currentStreak}-day streak! 🔥🔥`;
  } else if (currentStreak < 14) {
    message = `${currentStreak}-day streak! 🔥🔥🔥`;
  } else if (currentStreak < 30) {
    message = `${currentStreak}-day streak! 🔥🔥🔥🔥`;
  } else {
    message = `${currentStreak}-day streak! 🔥🔥🔥🔥🔥`;
  }

  return { currentStreak, longestStreak, isActive, message };
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥🔥🔥';
  if (streak >= 14) return '🔥🔥🔥🔥';
  if (streak >= 7) return '🔥🔥🔥';
  if (streak >= 3) return '🔥🔥';
  if (streak >= 1) return '🔥';
  return '💤';
}

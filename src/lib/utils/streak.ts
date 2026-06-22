import { startOfDay, differenceInCalendarDays } from 'date-fns';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  message: string;
}

/**
 * Pass streakOverride when a user has paid to restore a broken streak.
 * If the override was saved today or yesterday and the natural streak is 0,
 * the override count is used instead.
 */
export function calculateStreak(
  postDates: string[],
  streakOverride?: { count: number; date: string } | null
): StreakResult {
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
  let isActive = diffToday === 0 || diffToday === 1;

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

  // Apply paid streak restore:
  // - Works whether streak is active or not
  // - Treated as a "base" that the natural streak adds on top of
  let restoreBase = 0;
  if (streakOverride && streakOverride.count > 0) {
    const overrideDay = startOfDay(new Date(streakOverride.date));
    const diffOverride = differenceInCalendarDays(today, overrideDay);
    // Override is valid for today and the next day (gives user a day to post)
    if (diffOverride === 0 || diffOverride === 1) {
      restoreBase = streakOverride.count;
    }
  }

  // If not active (last post was more than yesterday), reset streak
  if (!isActive) {
    currentStreak = 0;
    if (restoreBase > 0) {
      // Streak was broken but restored — show restored count
      currentStreak = restoreBase;
      isActive = true;
    }
  } else if (restoreBase > 0 && currentStreak > 0) {
    // User posted again after restoring — add natural streak on top of restore base
    // but only if the restore happened before the natural streak started
    const newestPostDay = startOfDay(uniqueDates[0]);
    const overrideDay = startOfDay(new Date(streakOverride!.date));
    const postIsAfterRestore = differenceInCalendarDays(newestPostDay, overrideDay) >= 0;
    if (postIsAfterRestore) {
      currentStreak = restoreBase + currentStreak;
    }
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

import Link from 'next/link';
import { Heart, Trophy, Sparkles, MapPin, Globe, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Love Scoring
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
            Share the Love
          </span>
          <br />
          <span className="text-gray-900 dark:text-gray-100">
            Get Scored. Get Ranked.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Describe what your partner did for you today. Our AI scores their gesture, and they climb the local, city, and global leaderboards.
          <span className="text-pink-500 font-semibold"> The most thoughtful partners win.</span>
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-lg shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-200"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-lg hover:border-pink-500 hover:text-pink-500 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">AI Scoring</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Our AI evaluates thoughtfulness, romance, effort, uniqueness, and emotional impact — scoring each gesture from 1-100.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Leaderboards</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Compete on local (10km), city-wide, and global leaderboards. See who has the most thoughtful partner!
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Celebrate Love</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            A positive space to appreciate your partner publicly. Every post is a celebration of the love in your life.
          </p>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Three Tiers of <span className="text-pink-500">Love</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Whether you&apos;re across the street or across the world, see how your partner ranks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
            <MapPin className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Local</h4>
            <p className="text-xs text-gray-500">10km radius</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
            <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 dark:text-gray-100">City</h4>
            <p className="text-xs text-gray-500">Your city</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
            <Globe className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Global</h4>
            <p className="text-xs text-gray-500">Worldwide</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center text-sm text-gray-400">
        <p>Made with ❤️ for couples everywhere</p>
      </footer>
    </div>
  );
}

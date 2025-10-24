import { Trophy, TrendingUp, FileText, Lightbulb } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface LeaderboardEntry {
  userId: string;
  username: string;
  popularBlogs: number;
  successfulIdeas: number;
  totalScore: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.popularBlogs !== a.popularBlogs) {
      return b.popularBlogs - a.popularBlogs;
    }
    return b.successfulIdeas - a.successfulIdeas;
  });

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-500';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getRankBg = (rank: number) => {
    if (rank === 0) return 'bg-yellow-50 border-yellow-200';
    if (rank === 1) return 'bg-gray-50 border-gray-200';
    if (rank === 2) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        <p className="text-gray-600">
          Rankings based on popular blogs (3+ likes) and successful ideas (positive net votes)
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">User</div>
            <div className="col-span-3 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Popular Blogs
            </div>
            <div className="col-span-3 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Successful Ideas
            </div>
            <div className="col-span-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Score
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedLeaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition ${getRankBg(index)}`}
            >
              <div className="col-span-1">
                <div className="flex items-center justify-center">
                  {index < 3 ? (
                    <Trophy className={`w-6 h-6 ${getRankColor(index)}`} />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <UserAvatar username={entry.username} size="md" />
                  <span className="font-semibold text-gray-800">
                    {entry.username}
                  </span>
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">
                    {entry.popularBlogs}
                  </div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">
                    {entry.successfulIdeas}
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="font-bold text-lg text-gray-800">
                  {entry.totalScore}
                </div>
              </div>
            </div>
          ))}

          {sortedLeaderboard.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No rankings yet. Start creating content!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          How Rankings Work
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Popular Blogs:</span> Blog posts that have received 3 or more likes
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Successful Ideas:</span> Ideas where upvotes exceed downvotes (net positive votes)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Total Score:</span> Sum of popular blogs and successful ideas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

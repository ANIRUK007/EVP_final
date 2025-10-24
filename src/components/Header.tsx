import { LogOut, Lightbulb, BookOpen, Trophy } from 'lucide-react';
import { User } from '../types';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  currentUser: User;
  currentView: 'ideas' | 'blog' | 'leaderboard';
  onViewChange: (view: 'ideas' | 'blog' | 'leaderboard') => void;
  onLogout: () => void;
}

export default function Header({ currentUser, currentView, onViewChange, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-800">Community Hub</h1>

            <nav className="flex gap-2">
              <button
                onClick={() => onViewChange('ideas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'ideas'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Idea Validation
              </button>
              <button
                onClick={() => onViewChange('blog')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'blog'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Blog
              </button>
              <button
                onClick={() => onViewChange('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-800">
                Score: {currentUser.score.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <UserAvatar username={currentUser.username} size="md" />
              <span className="font-medium text-gray-800">{currentUser.username}</span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

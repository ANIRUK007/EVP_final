import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, MessageCircle, Send, X, Lightbulb } from 'lucide-react';
import { Idea, Comment, User } from '../types';
import UserAvatar from './UserAvatar';

interface IdeaValidationProps {
  ideas: Idea[];
  currentUser: User;
  onAddIdea: (title: string, content: string) => void;
  onVote: (ideaId: string, voteType: 'up' | 'down') => void;
  onAddComment: (ideaId: string, content: string) => void;
}

export default function IdeaValidation({
  ideas,
  currentUser,
  onAddIdea,
  onVote,
  onAddComment
}: IdeaValidationProps) {
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      onAddIdea(newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      setShowNewIdea(false);
    }
  };

  const handleSubmitComment = (ideaId: string) => {
    if (commentText.trim()) {
      onAddComment(ideaId, commentText);
      setCommentText('');
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    const scoreA = a.upvotes.length - a.downvotes.length;
    const scoreB = b.upvotes.length - b.downvotes.length;
    return scoreB - scoreA;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Idea Validation</h2>
          <p className="text-gray-600 mt-1">Share your ideas and get community feedback</p>
        </div>
        <button
          onClick={() => setShowNewIdea(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Post Idea
        </button>
      </div>

      {showNewIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Share Your Idea</h3>
              <button
                onClick={() => setShowNewIdea(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitIdea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="What's your idea?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={6}
                  placeholder="Describe your idea in detail..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Post Idea
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewIdea(false)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedIdeas.map((idea) => {
          const netVotes = idea.upvotes.length - idea.downvotes.length;
          const hasUpvoted = idea.upvotes.includes(currentUser.id);
          const hasDownvoted = idea.downvotes.includes(currentUser.id);
          const isExpanded = expandedIdea === idea.id;

          return (
            <div key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="flex">
                <div className="flex flex-col items-center gap-2 bg-gray-50 px-4 py-6">
                  <button
                    onClick={() => onVote(idea.id, 'up')}
                    className={`p-2 rounded-lg transition ${
                      hasUpvoted
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-green-100 text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <ArrowUp className="w-6 h-6" />
                  </button>
                  <span className={`font-bold text-lg ${netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {netVotes}
                  </span>
                  <button
                    onClick={() => onVote(idea.id, 'down')}
                    className={`p-2 rounded-lg transition ${
                      hasDownvoted
                        ? 'bg-red-100 text-red-600'
                        : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <ArrowDown className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar username={idea.username} size="md" />
                    <div>
                      <span className="font-semibold text-gray-800">{idea.username}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {new Date(idea.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{idea.content}</p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setExpandedIdea(isExpanded ? null : idea.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{idea.comments.length} Comments</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-4 mb-4">
                        {idea.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <UserAvatar username={comment.username} size="sm" />
                              <div>
                                <span className="font-semibold text-gray-800">{comment.username}</span>
                                <span className="text-gray-400 text-sm ml-2">
                                  {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmitComment(idea.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSubmitComment(idea.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedIdeas.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No ideas yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

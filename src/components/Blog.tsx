import { useState } from 'react';
import { Plus, Heart, X, Edit2, Trash2 } from 'lucide-react';
import { BlogPost, User } from '../types';
import UserAvatar from './UserAvatar';

interface BlogProps {
  posts: BlogPost[];
  currentUser: User;
  onAddPost: (title: string, content: string) => void;
  onEditPost: (postId: string, title: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onLikePost: (postId: string) => void;
}

export default function Blog({ posts, currentUser, onAddPost, onEditPost, onDeletePost, onLikePost }: BlogProps) {
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      if (editingPost) {
        onEditPost(editingPost.id, newTitle, newContent);
        setEditingPost(null);
      } else {
        onAddPost(newTitle, newContent);
      }
      setNewTitle('');
      setNewContent('');
      setShowNewPost(false);
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewContent(post.content);
    setShowNewPost(true);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewTitle('');
    setNewContent('');
    setShowNewPost(false);
  };

  const handleDeleteClick = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      onDeletePost(postId);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Community Blog</h2>
          <p className="text-gray-600 mt-1">Share your knowledge and experiences</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Write Post
        </button>
      </div>

      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingPost ? 'Edit Blog Post' : 'Write a Blog Post'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your blog post title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={12}
                  placeholder="Write your blog post content here..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {sortedPosts.map((post) => {
          const hasLiked = post.likedBy.includes(currentUser.id);
          const isAuthor = post.userId === currentUser.id;

          return (
          <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserAvatar username={post.username} size="lg" />
                  <div>
                    <div className="font-semibold text-gray-800">{post.username}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit post"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{post.title}</h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {post.content}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-2 transition ${
                    hasLiked
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-red-500' : ''}`} />
                  <span className="font-medium">{post.likedBy.length} Likes</span>
                </button>
              </div>
            </div>
          </article>
          );
        })}

        {sortedPosts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No blog posts yet. Start writing!</p>
          </div>
        )}
      </div>
    </div>
  );
}

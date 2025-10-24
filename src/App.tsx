import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import IdeaValidation from './components/IdeaValidation';
import Blog from './components/Blog';
import Leaderboard from './components/Leaderboard';
import { User, Idea, BlogPost, Comment } from './types';
import { supabase } from './lib/supabase';

interface LeaderboardEntry {
  userId: string;
  username: string;
  popularBlogs: number;
  successfulIdeas: number;
  totalScore: number;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'ideas' | 'blog' | 'leaderboard'>('ideas');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadIdeas();
      loadBlogPosts();
      loadLeaderboard();
    }
  }, [currentUser]);

  const loadIdeas = async () => {
    const { data: ideasData, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (ideasError) {
      console.error('Error loading ideas:', ideasError);
      return;
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*, users(username)');

    if (commentsError) {
      console.error('Error loading comments:', commentsError);
      return;
    }

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username');

    if (usersError) {
      console.error('Error loading users:', usersError);
      return;
    }

    const usersMap = new Map(usersData?.map(u => [u.id, u.username]) || []);

    const ideasWithComments = ideasData?.map(idea => {
      const ideaComments = commentsData
        ?.filter(c => c.idea_id === idea.id)
        .map(c => ({
          id: c.id,
          userId: c.user_id,
          username: c.users?.username || 'Unknown',
          content: c.content,
          timestamp: new Date(c.created_at).getTime()
        })) || [];

      return {
        id: idea.id,
        userId: idea.user_id,
        username: usersMap.get(idea.user_id) || 'Unknown',
        title: idea.title,
        content: idea.content,
        upvotes: idea.upvotes || [],
        downvotes: idea.downvotes || [],
        comments: ideaComments,
        timestamp: new Date(idea.created_at).getTime()
      };
    }) || [];

    setIdeas(ideasWithComments);
  };

  const loadBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, users(username)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading blog posts:', error);
      return;
    }

    const posts = data?.map(post => ({
      id: post.id,
      userId: post.user_id,
      username: post.users?.username || 'Unknown',
      title: post.title,
      content: post.content,
      likedBy: post.liked_by || [],
      timestamp: new Date(post.created_at).getTime()
    })) || [];

    setBlogPosts(posts);
  };

  const loadLeaderboard = async () => {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username');

    if (usersError) {
      console.error('Error loading users for leaderboard:', usersError);
      return;
    }

    const { data: ideasData, error: ideasError } = await supabase
      .from('ideas')
      .select('user_id, upvotes, downvotes');

    if (ideasError) {
      console.error('Error loading ideas for leaderboard:', ideasError);
      return;
    }

    const { data: blogsData, error: blogsError } = await supabase
      .from('blog_posts')
      .select('user_id, liked_by');

    if (blogsError) {
      console.error('Error loading blogs for leaderboard:', blogsError);
      return;
    }

    const leaderboardData: LeaderboardEntry[] = usersData?.map(user => {
      const userIdeas = ideasData?.filter(idea => idea.user_id === user.id) || [];
      const successfulIdeas = userIdeas.filter(
        idea => (idea.upvotes?.length || 0) - (idea.downvotes?.length || 0) > 0
      ).length;

      const userBlogs = blogsData?.filter(blog => blog.user_id === user.id) || [];
      const popularBlogs = userBlogs.filter(
        blog => (blog.liked_by?.length || 0) >= 3
      ).length;

      return {
        userId: user.id,
        username: user.username,
        popularBlogs,
        successfulIdeas,
        totalScore: popularBlogs + successfulIdeas
      };
    }) || [];

    setLeaderboard(leaderboardData);
  };

  const calculateScore = (currentScore: number, netVotes: number): number => {
    return (currentScore + Math.abs(netVotes)) / 2;
  };

  const handleLogin = async (user: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (data) {
      setCurrentUser({
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        score: parseFloat(data.score)
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIdeas([]);
    setBlogPosts([]);
  };

  const handleAddIdea = async (title: string, content: string) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        user_id: currentUser.id,
        title,
        content,
        upvotes: [],
        downvotes: []
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding idea:', error);
      return;
    }

    const newIdea: Idea = {
      id: data.id,
      userId: currentUser.id,
      username: currentUser.username,
      title: data.title,
      content: data.content,
      upvotes: [],
      downvotes: [],
      comments: [],
      timestamp: new Date(data.created_at).getTime()
    };

    setIdeas([newIdea, ...ideas]);
    loadLeaderboard();
  };

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    if (!currentUser) return;

    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    let newUpvotes = [...idea.upvotes];
    let newDownvotes = [...idea.downvotes];

    if (voteType === 'up') {
      if (newUpvotes.includes(currentUser.id)) {
        newUpvotes = newUpvotes.filter(id => id !== currentUser.id);
      } else {
        newUpvotes.push(currentUser.id);
        newDownvotes = newDownvotes.filter(id => id !== currentUser.id);
      }
    } else {
      if (newDownvotes.includes(currentUser.id)) {
        newDownvotes = newDownvotes.filter(id => id !== currentUser.id);
      } else {
        newDownvotes.push(currentUser.id);
        newUpvotes = newUpvotes.filter(id => id !== currentUser.id);
      }
    }

    const { error } = await supabase
      .from('ideas')
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes
      })
      .eq('id', ideaId);

    if (error) {
      console.error('Error voting:', error);
      return;
    }

    const netVotes = newUpvotes.length - newDownvotes.length;

    if (idea.userId === currentUser.id) {
      const newScore = calculateScore(currentUser.score, netVotes);

      await supabase
        .from('users')
        .update({ score: newScore })
        .eq('id', currentUser.id);

      setCurrentUser(prev => prev ? { ...prev, score: newScore } : null);
    }

    setIdeas(prevIdeas =>
      prevIdeas.map(i =>
        i.id === ideaId
          ? { ...i, upvotes: newUpvotes, downvotes: newDownvotes }
          : i
      )
    );

    loadLeaderboard();
  };

  const handleAddComment = async (ideaId: string, content: string) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: currentUser.id,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    const newComment: Comment = {
      id: data.id,
      userId: currentUser.id,
      username: currentUser.username,
      content: data.content,
      timestamp: new Date(data.created_at).getTime()
    };

    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === ideaId
          ? { ...idea, comments: [...idea.comments, newComment] }
          : idea
      )
    );
  };

  const handleEditBlogPost = async (postId: string, title: string, content: string) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title,
        content
      })
      .eq('id', postId);

    if (error) {
      console.error('Error updating blog post:', error);
      return;
    }

    setBlogPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, title, content } : p
      )
    );

    loadLeaderboard();
  };

  const handleDeleteBlogPost = async (postId: string) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting blog post:', error);
      return;
    }

    setBlogPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    loadLeaderboard();
  };

  const handleAddBlogPost = async (title: string, content: string) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        user_id: currentUser.id,
        title,
        content,
        liked_by: []
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding blog post:', error);
      return;
    }

    const newPost: BlogPost = {
      id: data.id,
      userId: currentUser.id,
      username: currentUser.username,
      title: data.title,
      content: data.content,
      likedBy: [],
      timestamp: new Date(data.created_at).getTime()
    };

    setBlogPosts([newPost, ...blogPosts]);
    loadLeaderboard();
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;

    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    let newLikedBy = [...post.likedBy];

    if (newLikedBy.includes(currentUser.id)) {
      newLikedBy = newLikedBy.filter(id => id !== currentUser.id);
    } else {
      newLikedBy.push(currentUser.id);
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({ liked_by: newLikedBy })
      .eq('id', postId);

    if (error) {
      console.error('Error liking post:', error);
      return;
    }

    setBlogPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, likedBy: newLikedBy } : p
      )
    );

    loadLeaderboard();
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      <main className="py-8">
        {currentView === 'ideas' ? (
          <IdeaValidation
            ideas={ideas}
            currentUser={currentUser}
            onAddIdea={handleAddIdea}
            onVote={handleVote}
            onAddComment={handleAddComment}
          />
        ) : currentView === 'blog' ? (
          <Blog
            posts={blogPosts}
            currentUser={currentUser}
            onAddPost={handleAddBlogPost}
            onEditPost={handleEditBlogPost}
            onDeletePost={handleDeleteBlogPost}
            onLikePost={handleLikePost}
          />
        ) : (
          <Leaderboard leaderboard={leaderboard} />
        )}
      </main>
    </div>
  );
}

export default App;

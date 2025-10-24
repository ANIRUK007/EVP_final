/*
  # Community Platform Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password` (text)
      - `score` (numeric, default 0)
      - `created_at` (timestamptz)
    
    - `ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `content` (text)
      - `upvotes` (text[], array of user IDs who upvoted)
      - `downvotes` (text[], array of user IDs who downvoted)
      - `created_at` (timestamptz)
    
    - `comments`
      - `id` (uuid, primary key)
      - `idea_id` (uuid, foreign key to ideas)
      - `user_id` (uuid, foreign key to users)
      - `content` (text)
      - `created_at` (timestamptz)
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `content` (text)
      - `liked_by` (text[], array of user IDs who liked)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to all operations
    - This is a demo app with open access

  3. Important Notes
    - Users can vote once per idea (tracked in upvotes/downvotes arrays)
    - Users can like once per blog post (tracked in liked_by array)
    - Score calculation: avg(current_score, abs(upvotes - downvotes))
*/

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  upvotes text[] DEFAULT '{}',
  downvotes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  liked_by text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Public can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view ideas"
  ON ideas FOR SELECT
  USING (true);

CREATE POLICY "Public can create ideas"
  ON ideas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update ideas"
  ON ideas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Public can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view blog posts"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Public can create blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update blog posts"
  ON blog_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

INSERT INTO users (id, username, email, password, score) VALUES
  ('1', 'alex_innovator', 'alex@demo.com', 'demo123', 0),
  ('2', 'sarah_creative', 'sarah@demo.com', 'demo123', 0),
  ('3', 'mike_builder', 'mike@demo.com', 'demo123', 0),
  ('4', 'emma_thinker', 'emma@demo.com', 'demo123', 0),
  ('5', 'david_entrepreneur', 'david@demo.com', 'demo123', 0)
ON CONFLICT (id) DO NOTHING;

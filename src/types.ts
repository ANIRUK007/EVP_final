export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  score: number;
}

export interface Idea {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface BlogPost {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likedBy: string[];
}

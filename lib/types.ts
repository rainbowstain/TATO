// Tipos compartidos entre servidor e islands (no importar código de servidor aquí).

export interface SessionUser {
  username: string;
  role: "user" | "admin";
  profilePicture: string | null;
}

export interface PublicUser {
  username: string;
  role: "user" | "admin";
  description: string;
  profilePicture: string | null;
}

export interface CommentView {
  id: string;
  author: string;
  authorPicture: string | null;
  content: string;
  dateLabel: string;
  likes: string[];
}

export interface PostView {
  id: string;
  title: string;
  content: string; // HTML ya sanitizado
  author: string;
  authorPicture: string | null;
  dateLabel: string;
  likes: string[];
  comments: CommentView[];
}

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
  friends: number;
}

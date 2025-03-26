export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: { [username: string]: boolean };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  likes: { [username: string]: boolean };
  comments: Comment[];
}

export interface User {
  username: string;
  password: string;
  role: string;
  description?: string;
  profilePicture?: string;
  following?: string[];
  followers?: string[];
}

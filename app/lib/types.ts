export type PostKind = "blog" | "proof";
export type PostStatus = "draft" | "review" | "published";
export type ProjectType = "image" | "video" | "gallery" | "case-study";

export type Post = {
  _id: string;
  kind: PostKind;
  status: PostStatus;
  slug: string;
  title: string;
  summary: string;
  cover: string;
  seoTitle?: string;
  seoDescription?: string;
  category?: string;
  body?: string;
  read?: string;
  client?: string;
  type?: ProjectType;
  year?: string;
  services?: string[];
  images?: string[];
  video?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type PostInput = Omit<Post, "_id" | "createdAt" | "updatedAt"> & {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PostDocument = Omit<Post, "_id" | "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
};

export type UserDocument = {
  email: string;
  passwordHash: string;
  name: string;
  position?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type AdminSession = {
  sub: string;
  email: string;
  name: string;
  position?: string;
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  type: ProjectType;
  cover: string;
  year: string;
  summary: string;
  images?: string[];
  video?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  services: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  excerpt: string;
  cover: string;
  body?: string;
};

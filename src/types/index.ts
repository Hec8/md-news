import { Timestamp } from 'firebase/firestore';

export interface Article {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage: string;
    author: string;
    authorId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    published: boolean;
    featured: boolean;
    slug: string;
    readingTime: number;
    tags: string[];
    views: number;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    readArticles?: string[];
    savedArticles?: string[];
    createdAt: Timestamp;
}

export interface ReadingStats {
    totalArticles: number;
    totalReadingTime: number;
    lastReadAt: Timestamp;
    favoriteCategories: string[];
}

export interface Comment {
    id: string;
    articleId: string;
    userId: string;
    userDisplayName: string;
    content: string;
    createdAt: Timestamp;
    likes: number;
    likedBy: string[];
}

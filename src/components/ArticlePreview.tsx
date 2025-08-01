'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, Calendar } from 'lucide-react';
import { Article } from '@/types';

interface ArticlePreviewProps {
    article: Article;
    featured?: boolean;
}

const ArticlePreview = ({ article, featured = false }: ArticlePreviewProps) => {
    const formattedDate = article.createdAt.toDate().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (featured) {
        return (
            <div className="bg-gradient-to-r from-red-900 to-black rounded-lg overflow-hidden border-2 border-red-600">
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center mb-4">
                        <span className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                            Article du jour
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 hover:text-red-400 transition-colors leading-tight">
                                <Link href={`/article/${article.slug}`}>
                                    {article.title}
                                </Link>
                            </h2>

                            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 line-clamp-3 leading-relaxed">
                                {article.excerpt}
                            </p>

                            <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 gap-2 sm:gap-4">
                                <div className="flex items-center">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span>{article.author}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span>{article.readingTime} min</span>
                                </div>
                            </div>

                            <Link
                                href={`/article/${article.slug}`}
                                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Lire maintenant
                            </Link>
                        </div>

                        <div className="relative h-64 md:h-80">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-red-600 transition-colors group">
            <div className="relative h-40 sm:h-48">
                <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
                    <Link href={`/article/${article.slug}`}>
                        {article.title}
                    </Link>
                </h3>

                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-400 gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{article.author}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{article.readingTime} min</span>
                    </div>
                </div>

                <div>
                    <Link
                        href={`/article/${article.slug}`}
                        className="text-red-400 hover:text-red-300 font-semibold transition-colors text-sm sm:text-base"
                    >
                        Lire la suite →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ArticlePreview;

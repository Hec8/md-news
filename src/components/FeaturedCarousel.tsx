'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';

interface FeaturedCarouselProps {
    articles: Article[];
}

const FeaturedCarousel = ({ articles }: FeaturedCarouselProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (articles.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % articles.length);
            }, 5000);

            return () => clearInterval(timer);
        }
    }, [articles.length]);

    if (!articles.length) {
        return (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
                <p className="text-gray-400">Aucun article en vedette pour le moment</p>
            </div>
        );
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % articles.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
    };

    return (
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-red-600">
            <div className="relative h-96 md:h-[500px]">
                {articles.map((article, index) => (
                    <div
                        key={article.id}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <Link href={`/article/${article.slug}`}>
                            <div className="relative h-full cursor-pointer group">
                                <Image
                                    src={article.coverImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-300 text-lg md:text-xl mb-4 line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-400">
                                        <span>{article.author}</span>
                                        <span className="mx-2">•</span>
                                        <span>{article.readingTime} min de lecture</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            {articles.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors z-10"
                        title="Article précédent"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors z-10"
                        title="Article suivant"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                        {articles.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-red-600' : 'bg-white/50'
                                    }`}
                                title={`Aller à l'article ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FeaturedCarousel;

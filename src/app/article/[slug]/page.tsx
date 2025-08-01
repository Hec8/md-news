'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, collection, query, where, limit, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import { Article } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticlePreview from '@/components/ArticlePreview';
import { Calendar, Clock, User, Heart, Share2, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

export default function ArticlePage() {
    const params = useParams();
    const { user } = useAuthContext();
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (params.slug) {
            fetchArticle(params.slug as string);
        }
    }, [params.slug]);

    useEffect(() => {
        if (user && article) {
            setIsSaved(user.savedArticles?.includes(article.id) || false);
            markAsRead();
        }
    }, [user, article]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchArticle = async (slug: string) => {
        try {
            // Récupérer l'article par slug
            const articlesQuery = query(
                collection(db, 'articles'),
                where('slug', '==', slug),
                where('published', '==', true),
                limit(1)
            );

            const articleSnapshot = await getDocs(articlesQuery);

            if (articleSnapshot.empty) {
                setArticle(null);
                setLoading(false);
                return;
            }

            const articleData = {
                id: articleSnapshot.docs[0].id,
                ...articleSnapshot.docs[0].data()
            } as Article;

            setArticle(articleData);

            // Récupérer les articles similaires
            const relatedQuery = query(
                collection(db, 'articles'),
                where('published', '==', true),
                limit(4)
            );

            const relatedSnapshot = await getDocs(relatedQuery);
            const related = relatedSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(relatedArticle => relatedArticle.id !== articleData.id) as Article[];

            setRelatedArticles(related.slice(0, 3));
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error('Erreur lors du chargement de l\'article');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = useCallback(async () => {
        if (!user || !article) return;

        try {
            const userRef = doc(db, 'users', user.uid);

            if (!(user.readArticles?.includes(article.id) || false)) {
                await updateDoc(userRef, {
                    readArticles: arrayUnion(article.id)
                });

                // Incrémenter le nombre de vues de l'article
                const articleRef = doc(db, 'articles', article.id);
                await updateDoc(articleRef, {
                    views: (article.views || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error marking article as read:', error);
        }
    }, [user, article]);

    const toggleSaveArticle = async () => {
        if (!user || !article) {
            toast.error('Vous devez être connecté pour sauvegarder un article');
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);

            if (isSaved) {
                await updateDoc(userRef, {
                    savedArticles: user.savedArticles?.filter(id => id !== article.id) || []
                });
                setIsSaved(false);
                toast.success('Article retiré des favoris');
            } else {
                await updateDoc(userRef, {
                    savedArticles: arrayUnion(article.id)
                });
                setIsSaved(true);
                toast.success('Article ajouté aux favoris');
            }
        } catch (error) {
            console.error('Error toggling save article:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const shareArticle = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: article?.title,
                    text: article?.excerpt,
                    url: url,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Lien copié dans le presse-papiers');
            } catch (error) {
                console.error('Erreur lors de la copie du lien:', error);
                toast.error('Erreur lors de la copie du lien');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement de l&apos;article...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Article non trouvé</h1>
                    <p className="text-gray-400 mb-8">L&apos;article que vous recherchez n&apos;existe pas ou a été supprimé.</p>
                    <Link
                        href="/"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Retour à l&apos;accueil
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const formattedDate = article.createdAt.toDate().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main>
                {/* Breadcrumb */}
                <div className="bg-gray-900 border-b border-gray-800">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex items-center text-sm text-gray-400">
                            <Link href="/" className="hover:text-red-400 transition-colors">
                                Accueil
                            </Link>
                            <span className="mx-2">→</span>
                            <span className="text-white">Article</span>
                        </nav>
                    </div>
                </div>

                {/* Article Header */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    <span>{article.author}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    <span>{article.readingTime} min de lecture</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-4 mb-8">
                                <button
                                    onClick={toggleSaveArticle}
                                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isSaved
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                                    {isSaved ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                                </button>

                                <button
                                    onClick={shareArticle}
                                    className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    <Share2 className="w-5 h-5 mr-2" />
                                    Partager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Cover Image */}
                        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Article Content */}
                        <div
                            className="prose prose-lg prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(article.content)
                            }}
                        />

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="bg-gray-900 py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white text-center mb-12">
                                Articles similaires
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {relatedArticles.map((relatedArticle) => (
                                    <ArticlePreview key={relatedArticle.id} article={relatedArticle} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

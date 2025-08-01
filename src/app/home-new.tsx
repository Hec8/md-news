'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ArticlePreview from '@/components/ArticlePreview';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
    const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
    const [todayArticle, setTodayArticle] = useState<Article | null>(null);
    const [recentArticles, setRecentArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // Récupérer les articles en vedette
                const featuredQuery = query(
                    collection(db, 'articles'),
                    where('published', '==', true),
                    where('featured', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const featuredSnapshot = await getDocs(featuredQuery);
                const featured = featuredSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Article[];

                // Récupérer l'article du jour (le plus récent publié)
                const todayQuery = query(
                    collection(db, 'articles'),
                    where('published', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                const todaySnapshot = await getDocs(todayQuery);
                const today = todaySnapshot.docs.length > 0 ? {
                    id: todaySnapshot.docs[0].id,
                    ...todaySnapshot.docs[0].data()
                } as Article : null;

                // Récupérer les articles récents
                const recentQuery = query(
                    collection(db, 'articles'),
                    where('published', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(6)
                );
                const recentSnapshot = await getDocs(recentQuery);
                const recent = recentSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Article[];

                setFeaturedArticles(featured);
                setTodayArticle(today);
                setRecentArticles(recent.filter(article => article.id !== today?.id));
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement des articles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="py-12 bg-gradient-to-r from-gray-900 via-black to-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                Bienvenue sur{' '}
                                <span className="text-red-500">DeadPool Blog</span>
                            </h1>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Découvrez un univers où l&apos;humour rencontre la profondeur,
                                où chaque article est une aventure unique dans l&apos;esprit
                                décalé mais brillant de Deadpool.
                            </p>
                        </div>

                        {/* Diaporama des articles en vedette */}
                        {featuredArticles.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center mb-6">
                                    <Sparkles className="w-6 h-6 text-red-500 mr-2" />
                                    <h2 className="text-2xl font-bold">Articles en vedette</h2>
                                </div>
                                <FeaturedCarousel articles={featuredArticles} />
                            </div>
                        )}
                    </div>
                </section>

                {/* Description du blog */}
                <section className="py-12 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="flex items-center justify-center mb-6">
                                <BookOpen className="w-8 h-8 text-red-500 mr-3" />
                                <h2 className="text-3xl font-bold">À propos de ce blog</h2>
                            </div>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Ici, nous explorons les sujets les plus variés avec l&apos;œil critique et
                                l&apos;humour irrévérencieux qui caractérisent notre anti-héros préféré.
                                Des réflexions philosophiques aux analyses pop culture, en passant par
                                des conseils de vie totalement décalés, chaque article est une plongée
                                dans un univers où rien n&apos;est jamais pris trop au sérieux... ou peut-être que si ?
                            </p>
                        </div>
                    </div>
                </section>

                {/* Article du jour */}
                {todayArticle && (
                    <section className="py-12">
                        <div className="container mx-auto px-4">
                            <ArticlePreview article={todayArticle} featured={true} />
                        </div>
                    </section>
                )}

                {/* Articles récents */}
                {recentArticles.length > 0 && (
                    <section className="py-12 bg-gray-900">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold mb-8 text-center">
                                Articles récents
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentArticles.map((article) => (
                                    <ArticlePreview key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Call to action */}
                <section className="py-16 bg-gradient-to-r from-red-900 to-black">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Rejoignez la communauté DeadPool
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Créez votre compte pour sauvegarder vos articles favoris,
                            suivre vos statistiques de lecture et découvrir du contenu personnalisé.
                        </p>
                        <a
                            href="/login"
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                        >
                            Commencer l&apos;aventure
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Clock, BookOpen, Heart, TrendingUp, Calendar } from 'lucide-react';
import { Article, ReadingStats } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
    const { user, loading: authLoading } = useAuthContext();
    const [readArticles, setReadArticles] = useState<Article[]>([]);
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'read' | 'saved'>('stats');

    useEffect(() => {
        if (user && !authLoading) {
            fetchUserData();
        }
    }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchUserData = async () => {
        if (!user) return;

        try {
            // Récupérer les articles lus
            if (user.readArticles && user.readArticles.length > 0) {
                const readQuery = query(
                    collection(db, 'articles'),
                    where('id', 'in', user.readArticles.slice(0, 10)) // Firestore limite à 10
                );
                const readSnapshot = await getDocs(readQuery);
                const readArticlesData = readSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Article[];
                setReadArticles(readArticlesData);
            }

            // Récupérer les articles sauvegardés
            if (user.savedArticles && user.savedArticles.length > 0) {
                const savedQuery = query(
                    collection(db, 'articles'),
                    where('id', 'in', user.savedArticles.slice(0, 10))
                );
                const savedSnapshot = await getDocs(savedQuery);
                const savedArticlesData = savedSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Article[];
                setSavedArticles(savedArticlesData);
            }

            // Calculer les statistiques de lecture
            const totalReadingTime = readArticles.reduce((total, article) => total + article.readingTime, 0);

            const stats: ReadingStats = {
                totalArticles: user.readArticles?.length || 0,
                totalReadingTime,
                lastReadAt: Timestamp.now(),
                favoriteCategories: []
            };

            setReadingStats(stats);
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const toggleSaveArticle = async (articleId: string) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            const isSaved = user.savedArticles?.includes(articleId) || false;

            let updatedSavedArticles;
            if (isSaved) {
                updatedSavedArticles = user.savedArticles?.filter(id => id !== articleId) || [];
                toast.success('Article retiré des favoris');
            } else {
                updatedSavedArticles = [...(user.savedArticles || []), articleId];
                toast.success('Article ajouté aux favoris');
            }

            await updateDoc(userRef, {
                savedArticles: updatedSavedArticles
            });

            // Mettre à jour le contexte local (vous pourriez avoir besoin d'une fonction de mise à jour dans le contexte)
        } catch (error) {
            console.error('Error toggling save article:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Accès non autorisé</h1>
                    <p className="text-gray-400 mb-8">Vous devez être connecté pour accéder à cette page.</p>
                    <Link
                        href="/login"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Se connecter
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-red-900 to-black rounded-lg p-6 mb-8 border border-red-600">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                            <p className="text-gray-300">{user.email}</p>
                            <p className="text-sm text-gray-400">
                                Membre depuis {user.createdAt.toDate().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === 'stats'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        Statistiques
                    </button>
                    <button
                        onClick={() => setActiveTab('read')}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === 'read'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <BookOpen className="w-5 h-5 inline mr-2" />
                        Articles lus
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === 'saved'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <Heart className="w-5 h-5 inline mr-2" />
                        Favoris
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'stats' && readingStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <BookOpen className="w-8 h-8 text-red-500" />
                                <span className="text-2xl font-bold text-white">{readingStats.totalArticles}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Articles lus</h3>
                            <p className="text-gray-400">Total des articles que vous avez lus</p>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <Clock className="w-8 h-8 text-red-500" />
                                <span className="text-2xl font-bold text-white">{readingStats.totalReadingTime}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Minutes de lecture</h3>
                            <p className="text-gray-400">Temps total passé à lire</p>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <Heart className="w-8 h-8 text-red-500" />
                                <span className="text-2xl font-bold text-white">{user.savedArticles?.length || 0}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Articles favoris</h3>
                            <p className="text-gray-400">Articles sauvegardés pour plus tard</p>
                        </div>
                    </div>
                )}

                {activeTab === 'read' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white mb-6">Historique de lecture</h2>
                        {readArticles.length > 0 ? (
                            <div className="space-y-4">
                                {readArticles.map((article) => (
                                    <div key={article.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-red-600 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-400 transition-colors">
                                                    <Link href={`/article/${article.slug}`}>
                                                        {article.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-gray-400 mb-2 line-clamp-2">{article.excerpt}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span className="mr-4">Lu le {article.createdAt.toDate().toLocaleDateString('fr-FR')}</span>
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>{article.readingTime} min</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleSaveArticle(article.id)}
                                                className={`ml-4 p-2 rounded-lg transition-colors ${(user.savedArticles?.includes(article.id) || false)
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:text-red-400'
                                                    }`}
                                                title={(user.savedArticles?.includes(article.id) || false) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            >
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun article lu</h3>
                                <p className="text-gray-500">Commencez à lire des articles pour voir votre historique ici.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white mb-6">Articles favoris</h2>
                        {savedArticles.length > 0 ? (
                            <div className="space-y-4">
                                {savedArticles.map((article) => (
                                    <div key={article.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-red-600 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-400 transition-colors">
                                                    <Link href={`/article/${article.slug}`}>
                                                        {article.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-gray-400 mb-2 line-clamp-2">{article.excerpt}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span className="mr-4">{article.createdAt.toDate().toLocaleDateString('fr-FR')}</span>
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>{article.readingTime} min</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleSaveArticle(article.id)}
                                                className="ml-4 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                title="Retirer des favoris"
                                            >
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun article favori</h3>
                                <p className="text-gray-500">Sauvegardez des articles pour les retrouver facilement ici.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, limit, startAfter, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticlePreview from '@/components/ArticlePreview';
import { Search, Filter, Calendar } from 'lucide-react';

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
    const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);

    const ARTICLES_PER_PAGE = 9;

    useEffect(() => {
        fetchArticles(true);
    }, [sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchArticles = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setLastDoc(null);
                setHasMore(true);
            } else {
                setLoadingMore(true);
            }

            // Requête simple sans orderBy pour éviter les index
            let articlesQuery = query(
                collection(db, 'articles'),
                where('published', '==', true),
                limit(ARTICLES_PER_PAGE * 2) // Récupérer plus pour compenser le tri côté client
            );

            // Pagination (seulement si on n'est pas en train de reset)
            if (!reset && lastDoc) {
                articlesQuery = query(articlesQuery, startAfter(lastDoc));
            }

            const articlesSnapshot = await getDocs(articlesQuery);
            let fetchedArticles = articlesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Article[];

            // Tri côté client selon le choix
            fetchedArticles = fetchedArticles.sort((a, b) => {
                if (sortBy === 'newest') {
                    const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
                    const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
                    return dateB - dateA;
                } else if (sortBy === 'oldest') {
                    const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
                    const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
                    return dateA - dateB;
                } else if (sortBy === 'popular') {
                    return (b.views || 0) - (a.views || 0);
                }
                return 0;
            });

            // Limiter aux articles demandés après tri
            fetchedArticles = fetchedArticles.slice(0, ARTICLES_PER_PAGE);

            // Extraire tous les tags uniques
            const tags = new Set<string>();
            fetchedArticles.forEach(article => {
                article.tags.forEach(tag => tags.add(tag));
            });

            if (reset) {
                setArticles(fetchedArticles);
                setAllTags(Array.from(tags));
            } else {
                setArticles(prev => [...prev, ...fetchedArticles]);
                setAllTags(prev => Array.from(new Set([...prev, ...Array.from(tags)])));
            }

            // Mettre à jour la pagination
            setLastDoc(articlesSnapshot.docs[articlesSnapshot.docs.length - 1] || null);
            setHasMore(articlesSnapshot.docs.length === ARTICLES_PER_PAGE * 2);

        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Filtrage côté client
    const filteredArticles = articles.filter(article => {
        const matchesSearch = searchTerm === '' ||
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTag = selectedTag === '' || article.tags.includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchArticles(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-sm sm:text-lg">Chargement des articles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-8">
                {/* Header de la page */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Tous les <span className="text-red-500">Articles</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Explorez notre collection complète d'articles, des réflexions les plus profondes
                        aux analyses les plus décalées.
                    </p>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-gray-900 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Recherche */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher des articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 sm:py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm sm:text-base"
                            />
                        </div>

                        {/* Filtre par tag */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 sm:py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 appearance-none text-sm sm:text-base"
                                aria-label="Filtrer par tag"
                            >
                                <option value="">Tous les tags</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tri */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 sm:py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 appearance-none text-sm sm:text-base"
                                aria-label="Trier les articles"
                            >
                                <option value="newest">Plus récents</option>
                                <option value="oldest">Plus anciens</option>
                                <option value="popular">Plus populaires</option>
                            </select>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
                            <span>
                                {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
                            </span>
                            {selectedTag && (
                                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                                    Tag: {selectedTag}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Liste des articles */}
                {filteredArticles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                            {filteredArticles.map((article) => (
                                <ArticlePreview key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Bouton Charger plus */}
                        {hasMore && (
                            <div className="text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-sm sm:text-base"
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Chargement...
                                        </>
                                    ) : (
                                        'Charger plus d\'articles'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 sm:py-16">
                        <div className="text-6xl sm:text-8xl mb-4">📝</div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4">Aucun article trouvé</h3>
                        <p className="text-gray-400 mb-6 text-sm sm:text-base">
                            {searchTerm || selectedTag
                                ? 'Essayez de modifier vos critères de recherche.'
                                : 'Il n&apos;y a pas encore d&apos;articles publiés.'
                            }
                        </p>
                        {(searchTerm || selectedTag) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTag('');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

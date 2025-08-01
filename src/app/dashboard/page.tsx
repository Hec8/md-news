'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { Article } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuillEditor from '@/components/QuillEditor';
import { Plus, Upload, Eye, Trash2, Edit, Save, X, Image as ImageIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const { user, isAdmin, loading } = useAuthContext();
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title' | 'views'>('recent');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [featured, setFeatured] = useState(false);
    const [published, setPublished] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
            return;
        }

        if (isAdmin) {
            fetchArticles();
        }
    }, [loading, isAdmin, router]);

    const fetchArticles = async () => {
        try {
            const articlesQuery = query(
                collection(db, 'articles'),
                orderBy('createdAt', 'desc')
            );

            const articlesSnapshot = await getDocs(articlesQuery);
            const articlesData = articlesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Article[];

            setArticles(articlesData);
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Erreur lors du chargement des articles');
        }
    };

    // Filtrer et trier les articles
    const filteredAndSortedArticles = () => {
        let filtered = articles;

        // Filtrage par terme de recherche
        if (searchTerm.trim()) {
            filtered = articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Tri
        switch (sortBy) {
            case 'recent':
                return filtered.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            case 'oldest':
                return filtered.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
            case 'title':
                return filtered.sort((a, b) => a.title.localeCompare(b.title));
            case 'views':
                return filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
            default:
                return filtered;
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const handleImageUpload = async (file: File) => {
        try {
            const downloadURL = await uploadImageToCloudinary(file);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Erreur lors du téléchargement de l\'image');
            return null;
        }
    };

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const imageUrl = await handleImageUpload(file);
        if (imageUrl) {
            setCoverImage(imageUrl);
            toast.success('Image de couverture téléchargée');
        }
        setIsLoading(false);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setExcerpt('');
        setCoverImage('');
        setTags('');
        setFeatured(false);
        setPublished(false);
        setEditingArticle(null);
    };

    const handleSaveArticle = async () => {
        // Validation des champs
        if (!title.trim()) {
            toast.error('Le titre est obligatoire');
            return;
        }

        if (!content.trim() || content === '<br>' || content === '<div><br></div>') {
            toast.error('Le contenu est obligatoire');
            return;
        }

        if (!excerpt.trim()) {
            toast.error('L\'extrait est obligatoire');
            return;
        }

        setIsSaving(true);

        try {
            const slug = generateSlug(title);
            const readingTime = calculateReadingTime(content);
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const articleData = {
                title: title.trim(),
                content: content.trim(),
                excerpt: excerpt.trim(),
                coverImage: coverImage || '/placeholder-article.jpg',
                author: user?.displayName || 'Admin',
                authorId: user?.uid || '',
                slug,
                readingTime,
                tags: tagsArray,
                featured,
                published,
                views: editingArticle?.views || 0,
                updatedAt: serverTimestamp(),
            };

            if (editingArticle) {
                // Update existing article
                await updateDoc(doc(db, 'articles', editingArticle.id), articleData);
                toast.success('Article mis à jour avec succès');
            } else {
                // Create new article
                await addDoc(collection(db, 'articles'), {
                    ...articleData,
                    createdAt: serverTimestamp(),
                });
                toast.success('Article créé avec succès');
            }

            resetForm();
            setShowEditor(false);
            await fetchArticles(); // Attendre que les articles soient rechargés
        } catch (error) {
            console.error('Error saving article:', error);
            toast.error('Erreur lors de la sauvegarde de l\'article');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle(article);
        setTitle(article.title);
        setContent(article.content);
        setExcerpt(article.excerpt);
        setCoverImage(article.coverImage);
        setTags(article.tags.join(', '));
        setFeatured(article.featured);
        setPublished(article.published);
        setShowEditor(true);
    };

    const handleDeleteArticle = async (articleId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'articles', articleId));
            toast.success('Article supprimé avec succès');
            fetchArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error('Erreur lors de la suppression de l\'article');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                    <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Administrateur</h1>
                    <button
                        onClick={() => setShowEditor(true)}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvel article
                    </button>
                </div>

                {/* Editor Modal */}
                {showEditor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold">
                                        {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowEditor(false);
                                            resetForm();
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                        aria-label="Fermer"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Titre *
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            placeholder="Titre de l'article"
                                        />
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Extrait *
                                        </label>
                                        <textarea
                                            value={excerpt}
                                            onChange={(e) => setExcerpt(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            rows={3}
                                            placeholder="Bref résumé de l'article"
                                        />
                                    </div>

                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Image de couverture
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleCoverImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    aria-label="Sélectionner une image de couverture"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isLoading}
                                                    className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-3 sm:py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                                >
                                                    {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    ) : (
                                                        <Upload className="w-5 h-5 mr-2" />
                                                    )}
                                                    {isLoading ? 'Téléchargement...' : 'Télécharger une image'}
                                                </button>
                                            </div>

                                            {coverImage && (
                                                <div className="bg-gray-800 rounded-lg p-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                                        <img
                                                            src={coverImage}
                                                            alt="Aperçu"
                                                            className="w-full h-32 sm:w-16 sm:h-16 object-cover rounded"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center text-green-400 mb-1">
                                                                <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                                <span className="text-sm font-medium">Image téléchargée avec succès</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {coverImage.split('/').pop()?.split('_').pop() || 'image.jpg'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setCoverImage('')}
                                                            className="self-start sm:self-center text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                            title="Supprimer l'image"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Tags (séparés par des virgules)
                                        </label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            placeholder="deadpool, humour, philosophie"
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={featured}
                                                onChange={(e) => setFeatured(e.target.checked)}
                                                className="mr-2 w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                                                aria-label="Marquer comme article en vedette"
                                            />
                                            <span className="text-gray-300 text-sm sm:text-base">Article en vedette</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={published}
                                                onChange={(e) => setPublished(e.target.checked)}
                                                className="mr-2 w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                                                aria-label="Publier l'article"
                                            />
                                            <span className="text-gray-300 text-sm sm:text-base">Publié</span>
                                        </label>
                                    </div>

                                    {/* Content Editor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Contenu *
                                        </label>
                                        <div className="bg-white rounded-lg">
                                            <QuillEditor
                                                value={content}
                                                onChange={setContent}
                                                placeholder="Écrivez votre article ici..."
                                                className="h-64 sm:h-80 lg:h-96"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Utilisez la barre d'outils pour formater votre texte et insérer des images.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-700 mt-8">
                                        <button
                                            onClick={() => {
                                                setShowEditor(false);
                                                resetForm();
                                            }}
                                            className="order-2 sm:order-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSaveArticle}
                                            disabled={isSaving}
                                            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-50 min-w-[140px]"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 mr-2" />
                                                    {editingArticle ? 'Mettre à jour' : 'Publier'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Articles List */}
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-semibold">Articles ({filteredAndSortedArticles().length})</h2>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un article..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                    />
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                    aria-label="Trier les articles"
                                >
                                    <option value="recent">Plus récents</option>
                                    <option value="oldest">Plus anciens</option>
                                    <option value="title">Par titre</option>
                                    <option value="views">Par vues</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredAndSortedArticles().length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-gray-400">
                            <p>{searchTerm ? 'Aucun article trouvé pour votre recherche.' : 'Aucun article créé pour le moment.'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {filteredAndSortedArticles().map((article) => (
                                <div key={article.id} className="p-4 sm:p-6 hover:bg-gray-800 transition-colors">
                                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-400 mb-3 line-clamp-2 text-sm sm:text-base">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    📅 {article.createdAt.toDate().toLocaleDateString('fr-FR')}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${article.published ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                                                        }`}>
                                                        {article.published ? 'Publié' : 'Brouillon'}
                                                    </span>
                                                    {article.featured && (
                                                        <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                                                            ⭐ En vedette
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="flex items-center">
                                                    👁️ {article.views || 0} vues
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end space-x-1 sm:space-x-2 lg:ml-4 flex-shrink-0">
                                            <a
                                                href={`/article/${article.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 sm:p-3 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-700"
                                                title="Voir l'article"
                                            >
                                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleEditArticle(article)}
                                                className="p-2 sm:p-3 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-700"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteArticle(article.id)}
                                                className="p-2 sm:p-3 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

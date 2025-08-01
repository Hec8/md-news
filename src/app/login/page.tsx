'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (!isLogin && password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success('Connexion réussie !');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success('Compte créé avec succès !');
            }
            router.push('/');
        } catch (error: unknown) {
            console.error('Authentication error:', error);
            const authError = error as { code: string };

            switch (authError.code) {
                case 'auth/user-not-found':
                    toast.error('Aucun compte trouvé avec cette adresse email');
                    break;
                case 'auth/wrong-password':
                    toast.error('Mot de passe incorrect');
                    break;
                case 'auth/email-already-in-use':
                    toast.error('Cette adresse email est déjà utilisée');
                    break;
                case 'auth/weak-password':
                    toast.error('Le mot de passe est trop faible');
                    break;
                case 'auth/invalid-email':
                    toast.error('Adresse email invalide');
                    break;
                default:
                    toast.error('Une erreur est survenue. Veuillez réessayer.');
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-red-500">DeadPool Blog</h1>
                        </div>
                    </Link>

                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Connexion' : 'Créer un compte'}
                    </h2>
                    <p className="text-gray-400">
                        {isLogin
                            ? 'Connectez-vous pour accéder à vos articles favoris'
                            : 'Rejoignez la communauté DeadPool'
                        }
                    </p>
                </div>

                {/* Form */}
                <div className="bg-gray-900 rounded-lg border border-red-600 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (for registration) */}
                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                isLogin ? 'Se connecter' : 'Créer le compte'
                            )}
                        </button>
                    </form>

                    {/* Toggle between login and register */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            {isLogin ? "Vous n&apos;avez pas de compte ? " : "Vous avez déjà un compte ? "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                            >
                                {isLogin ? 'Créer un compte' : 'Se connecter'}
                            </button>
                        </p>
                    </div>

                    {/* Back to home */}
                    <div className="mt-4 text-center">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

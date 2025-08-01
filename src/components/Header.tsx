'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, LogOut, BookOpen, Settings, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
    const { user, isAuthenticated, isAdmin } = useAuthContext();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success('Déconnexion réussie');
            setShowUserMenu(false);
            setShowMobileMenu(false);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    return (
        <header className="bg-black text-white border-b-2 border-red-600 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo et nom du blog */}
                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-red-500">DeadPool</h1>
                            <p className="text-xs sm:text-sm text-gray-300">Blog</p>
                        </div>
                    </Link>

                    {/* Navigation Desktop */}
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex space-x-6">
                            <Link href="/" className="hover:text-red-400 transition-colors">
                                Accueil
                            </Link>
                            <Link href="/articles" className="hover:text-red-400 transition-colors">
                                Articles
                            </Link>
                            {isAdmin && (
                                <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                                    Dashboard
                                </Link>
                            )}
                        </nav>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden lg:inline">{user?.displayName}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-red-600 rounded-lg shadow-lg z-50">
                                        <div className="py-2">
                                            <Link
                                                href="/user"
                                                className="flex items-center px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Mon profil
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Se déconnecter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                Se connecter
                            </Link>
                        )}
                    </div>

                    {/* Bouton menu mobile */}
                    <div className="md:hidden flex items-center space-x-2">
                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="p-2 hover:text-red-400 transition-colors"
                                    aria-label="Menu utilisateur"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-red-600 rounded-lg shadow-lg z-50">
                                        <div className="py-2">
                                            <Link
                                                href="/user"
                                                className="flex items-center px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Mon profil
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Se déconnecter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 hover:text-red-400 transition-colors"
                            aria-label="Menu de navigation"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Menu mobile */}
                {showMobileMenu && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
                        <nav className="flex flex-col space-y-3 pt-4">
                            <Link
                                href="/"
                                className="py-2 hover:text-red-400 transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Accueil
                            </Link>
                            <Link
                                href="/articles"
                                className="py-2 hover:text-red-400 transition-colors"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Articles
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/dashboard"
                                    className="py-2 hover:text-red-400 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    href="/login"
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-center mt-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Se connecter
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

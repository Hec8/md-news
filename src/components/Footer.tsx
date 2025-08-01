import Link from 'next/link';
import { BookOpen, Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black text-white border-t-2 border-red-600">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo et description */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-500">DeadPool Blog</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 max-w-md">
                            Un blog inspiré de l&apos;univers de Deadpool où l&apos;humour rencontre la profondeur.
                            Découvrez des articles captivants dans un style unique.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-4">Navigation</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-red-400 transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link href="/articles" className="text-gray-300 hover:text-red-400 transition-colors">
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-red-400 transition-colors">
                                    À propos
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-red-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Réseaux sociaux */}
                    <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-4">Suivez-nous</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors" title="Twitter">
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors" title="Github">
                                <Github className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-300 hover:text-red-400 transition-colors" title="Email">
                                <Mail className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                    <p className="text-gray-400">
                        © 2025 DeadPool Blog. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

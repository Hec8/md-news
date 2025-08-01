'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import toast from 'react-hot-toast';
import {
    Bold,
    Italic,
    Underline,
    Link,
    Image as ImageIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    Palette,
    Eye,
    EyeOff
} from 'lucide-react';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function QuillEditor({
    value,
    onChange,
    placeholder = "Écrivez votre contenu ici...",
    className = ""
}: QuillEditorProps) {
    const [isPreview, setIsPreview] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontSizePicker, setShowFontSizePicker] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const colors = [
        '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
        '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A'
    ];

    const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

    // Synchroniser le contenu de l'éditeur avec la prop value
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleCommand = useCallback((command: string, val?: string) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        setTimeout(() => {
            if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
            }
        }, 10);
    }, [onChange]);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.loading('Upload de l\'image...', { id: 'image-upload' });
            const imageUrl = await uploadImageToCloudinary(file);
            const img = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
            handleCommand('insertHTML', img);
            toast.success('Image ajoutée', { id: 'image-upload' });
        } catch (error) {
            console.error('Erreur upload image:', error);
            toast.error('Erreur lors de l\'upload de l\'image', { id: 'image-upload' });
        }

        e.target.value = '';
    }, [handleCommand]);

    const handleLinkInsert = useCallback(() => {
        const url = prompt('Entrez l\'URL du lien:', 'https://');
        if (url && url !== 'https://') {
            handleCommand('createLink', url);
        }
    }, [handleCommand]);

    const handleColorChange = useCallback((color: string) => {
        handleCommand('foreColor', color);
        setShowColorPicker(false);
    }, [handleCommand]);

    const handleFontSizeChange = useCallback((size: string) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = size;
                try {
                    range.surroundContents(span);
                } catch {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                }
                if (editorRef.current) {
                    onChange(editorRef.current.innerHTML);
                }
            }
        }
        setShowFontSizePicker(false);
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
            {/* Toolbar - Very visible */}
            <div className="bg-gray-100 border-b border-gray-300 p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Basic Format Buttons */}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => handleCommand('bold')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Gras"
                        >
                            <Bold className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCommand('italic')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Italique"
                        >
                            <Italic className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCommand('underline')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Souligné"
                        >
                            <Underline className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    <div className="w-px bg-gray-400 h-8"></div>

                    {/* Headers */}
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleCommand('formatBlock', e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-sm shadow-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        title="Style de titre"
                    >
                        <option value="" className="text-gray-700">Titre...</option>
                        <option value="h1" className="text-gray-700 font-bold">Titre 1</option>
                        <option value="h2" className="text-gray-700 font-semibold">Titre 2</option>
                        <option value="h3" className="text-gray-700 font-medium">Titre 3</option>
                        <option value="h4" className="text-gray-700">Titre 4</option>
                        <option value="p" className="text-gray-700">Paragraphe</option>
                    </select>

                    <div className="w-px bg-gray-400 h-8"></div>

                    {/* Lists */}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => handleCommand('insertUnorderedList')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Liste à puces"
                        >
                            <List className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCommand('insertOrderedList')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Liste numérotée"
                        >
                            <ListOrdered className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    <div className="w-px bg-gray-400 h-8"></div>

                    {/* Alignment */}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => handleCommand('justifyLeft')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Aligner à gauche"
                        >
                            <AlignLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCommand('justifyCenter')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Centrer"
                        >
                            <AlignCenter className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCommand('justifyRight')}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Aligner à droite"
                        >
                            <AlignRight className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    <div className="w-px bg-gray-400 h-8"></div>

                    {/* Font Size */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center"
                            title="Taille de police"
                        >
                            <Type className="w-4 h-4 text-gray-700" />
                        </button>
                        {showFontSizePicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 py-1">
                                {fontSizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => handleFontSizeChange(size)}
                                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap"
                                    >
                                        Taille {size}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color Picker */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center"
                            title="Couleur du texte"
                        >
                            <Palette className="w-4 h-4 text-gray-700" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-2">
                                <div className="grid grid-cols-6 gap-1">
                                    {colors.map((color, index) => {
                                        const colorClasses = [
                                            'bg-black', 'bg-red-500', 'bg-green-500', 'bg-blue-500',
                                            'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500',
                                            'bg-purple-800', 'bg-green-800', 'bg-pink-300', 'bg-red-800'
                                        ];
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorChange(color)}
                                                className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform shadow-sm ${colorClasses[index] || 'bg-gray-500'}`}
                                                title={color}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px bg-gray-400 h-8"></div>

                    {/* Link and Image */}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={handleLinkInsert}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Insérer un lien"
                        >
                            <Link className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Insérer une image"
                        >
                            <ImageIcon className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    <div className="flex-1"></div>

                    {/* Preview Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className={`p-2 border rounded transition-colors shadow-sm ${isPreview
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        title={isPreview ? 'Mode édition' : 'Aperçu'}
                    >
                        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                aria-label="Sélectionner une image"
            />

            {/* Editor Content */}
            <div className="relative">
                {isPreview ? (
                    <div
                        className="p-4 min-h-80 overflow-y-auto prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: value }}
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        className="p-4 min-h-80 overflow-y-auto outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-inset ltr text-left"
                        dir="ltr"
                        suppressContentEditableWarning={true}
                    />
                )}

                {/* Placeholder */}
                {!value && !isPreview && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
                <div>
                    Mots: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} |
                    Caractères: {value.replace(/<[^>]*>/g, '').length}
                </div>
                <div>
                    Utilisez Ctrl+B/I/U pour formater rapidement
                </div>
            </div>
        </div>
    );
}

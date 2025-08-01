# 🎯 Deadpool Blog - Application de Blog Complète

Une application de blog moderne avec thème Deadpool, développée avec Next.js 15, TypeScript, Tailwind CSS et Firebase.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Inscription et connexion avec email/mot de passe
- Gestion des sessions utilisateur
- Protection des routes administrateur

### 📝 Gestion des Articles
- **Dashboard Administrateur** : Interface WYSIWYG avec React-Quill
- **Publication d'articles** : Titre, contenu riche, image de couverture
- **Gestion des métadonnées** : Tags, résumé, statut de publication
- **Aperçu en temps réel** des articles

### 👤 Profils Utilisateur
- **Statistiques de lecture** : Articles lus, temps de lecture total
- **Articles sauvegardés** : Liste des articles favoris
- **Historique de lecture** : Suivi des articles consultés

### 🎨 Interface Utilisateur
- **Thème Deadpool** : Rouge et noir avec design moderne
- **Design responsive** : Compatible mobile, tablette et desktop
- **Carrousel d'articles** : Navigation fluide avec indicateurs
- **Mode sombre** optimisé

### 📱 Expérience Utilisateur
- **Navigation intuitive** : Header avec menu utilisateur
- **Recherche d'articles** : Filtrage par tags et contenu
- **Temps de lecture estimé** pour chaque article
- **Articles connexes** : Suggestions basées sur les tags

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, TypeScript, Tailwind CSS
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Éditeur** : React-Quill WYSIWYG
- **Icons** : Lucide React
- **Notifications** : React-Hot-Toast
- **Sanitisation** : DOMPurify

## 📦 Installation

### Prérequis
- Node.js 18+ et npm/yarn
- Compte Firebase

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <your-repo-url>
cd deadpool-blog
```

2. **Installer les dépendances**
```bash
npm install
# ou si vous avez des erreurs de compatibilité
npm install --legacy-peer-deps
```

3. **Configuration Firebase**
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Créez un nouveau projet
   - Activez Authentication (Email/Password)
   - Créez une base de données Firestore
   - Configurez Firebase Storage
   - Copiez les clés de configuration dans `.env.local`

4. **Variables d'environnement**
   - Le fichier `.env.local` est déjà configuré
   - Remplacez les valeurs par celles de votre projet Firebase

5. **Lancer l'application**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

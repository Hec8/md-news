# Blog Deadpool - Configuration Cloudinary

## Étapes de configuration Cloudinary

### 1. Créer un compte Cloudinary
1. Allez sur [cloudinary.com](https://cloudinary.com)
2. Créez un compte gratuit
3. Accédez à votre Dashboard

### 2. Récupérer les informations de configuration
Dans votre Dashboard Cloudinary, vous trouverez :
- **Cloud Name** : Votre nom de cloud unique
- **API Key** : Votre clé API
- **API Secret** : Votre secret API (gardez-le privé !)

### 3. Créer un Upload Preset (ÉTAPE CRUCIALE)
1. Dans votre Dashboard Cloudinary, allez dans **Settings** > **Upload**
2. Scrollez jusqu'à **Upload presets**
3. Cliquez sur **Add upload preset**
4. Configurez :
   - **Upload preset name** : `deadpool-blog-unsigned` (ou le nom de votre choix)
   - **Signing Mode** : **Unsigned** (TRÈS IMPORTANT !)
   - **Folder** : `blog-images` (optionnel)
   - **Access Mode** : `Public`
   - **Transformation** : Ajoutez des transformations si nécessaire (resize, quality, etc.)
5. Sauvegardez

⚠️ **IMPORTANT** : L'upload preset DOIT être en mode "Unsigned" pour fonctionner côté client.

### 4. Configurer les variables d'environnement
Copiez le fichier `.env.example` vers `.env.local` :
```bash
cp .env.example .env.local
```

Puis remplissez les variables Cloudinary :
```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=deadpool-blog-unsigned
```

### 5. Redémarrer l'application
```bash
npm run dev
```

## Dépannage

### Erreur "Erreur lors de l'upload de l'image"

1. **Vérifiez les variables d'environnement** :
   - Ouvrez la console du navigateur (F12)
   - Regardez les logs de debug qui affichent les valeurs des variables
   - Assurez-vous qu'elles ne sont pas `undefined`

2. **Vérifiez l'upload preset** :
   - Dans Cloudinary Dashboard > Settings > Upload
   - Trouvez votre preset et vérifiez qu'il est en mode "Unsigned"
   - Le nom doit correspondre exactement à `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

3. **Testez avec cURL** :
   ```bash
   curl -X POST \
     https://api.cloudinary.com/v1_1/VOTRE_CLOUD_NAME/image/upload \
     -F "upload_preset=VOTRE_PRESET_NAME" \
     -F "file=@chemin/vers/image.jpg"
   ```

4. **Erreurs courantes** :
   - `Invalid upload preset` : Le preset n'existe pas ou n'est pas en mode unsigned
   - `401 Unauthorized` : Problème avec l'API key ou le preset signé
   - `400 Bad Request` : Fichier invalide ou preset mal configuré

## Fonctionnalités Cloudinary implémentées

### ✅ Upload d'images de couverture
- Upload direct depuis le dashboard
- Prévisualisation de l'image
- Feedback utilisateur avec toast

### ✅ Upload d'images dans l'éditeur
- Insertion d'images directement dans le contenu
- Upload vers Cloudinary avec feedback
- Images optimisées automatiquement

### ✅ Suppression d'images
- API endpoint pour supprimer les images non utilisées
- Fonction utilitaire pour extraire le public_id

## Avantages de Cloudinary vs Firebase Storage

| Fonctionnalité | Cloudinary | Firebase Storage |
|----------------|------------|------------------|
| Upload direct côté client | ✅ | ❌ (nécessite auth) |
| Transformations automatiques | ✅ | ❌ |
| CDN global | ✅ | ✅ |
| Optimisation automatique | ✅ | ❌ |
| Interface de gestion | ✅ | Basique |
| Coût pour petits projets | Gratuit 25GB | Gratuit 5GB |

## URLs d'exemple
- Image originale : `https://res.cloudinary.com/votre-cloud/image/upload/v1234567890/blog-images/sample.jpg`
- Image redimensionnée : `https://res.cloudinary.com/votre-cloud/image/upload/w_400,h_300,c_fit/v1234567890/blog-images/sample.jpg`
- Image avec qualité optimisée : `https://res.cloudinary.com/votre-cloud/image/upload/q_auto,f_auto/v1234567890/blog-images/sample.jpg`

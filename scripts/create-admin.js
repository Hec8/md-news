// Script pour créer un compte administrateur par défaut
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies valeurs)
const firebaseConfig = {
    apiKey: "AIzaSyAsCrpWdzSJQvjbqwzzZs_ycjNy8YMyg5Y",
    authDomain: "blog-miguel-eb14e.firebaseapp.com",
    projectId: "blog-miguel-eb14e",
    storageBucket: "blog-miguel-eb14e.appspot.com",
    messagingSenderId: "658063094643",
    appId: "1:658063094643:web:fe4772a432041607f00b06"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Informations du compte administrateur
const adminData = {
    email: "admin@deadpool-blog.com",
    password: "DeadpoolAdmin123!",
    displayName: "Administrateur Deadpool"
};

async function createAdminAccount() {
    try {
        console.log("🔥 Création du compte administrateur...");

        // Créer le compte utilisateur
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            adminData.email,
            adminData.password
        );

        const user = userCredential.user;
        console.log("✅ Compte utilisateur créé:", user.uid);

        // Ajouter les données utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: adminData.email,
            displayName: adminData.displayName,
            isAdmin: true,
            createdAt: serverTimestamp(),
            readingStats: {
                articlesRead: 0,
                totalReadingTime: 0,
                lastReadAt: null
            },
            savedArticles: []
        });

        console.log("✅ Données utilisateur ajoutées à Firestore");
        console.log("🎯 Compte administrateur créé avec succès !");
        console.log("📧 Email:", adminData.email);
        console.log("🔑 Mot de passe:", adminData.password);
        console.log("⚠️  IMPORTANT: Changez le mot de passe après la première connexion !");

    } catch (error) {
        console.error("❌ Erreur lors de la création du compte admin:", error);

        if (error.code === 'auth/email-already-in-use') {
            console.log("📧 Le compte admin existe déjà avec cet email");
        } else if (error.code === 'auth/weak-password') {
            console.log("🔑 Le mot de passe est trop faible");
        } else {
            console.log("🔍 Code d'erreur:", error.code);
        }
    }
}

// Exécuter le script
createAdminAccount();

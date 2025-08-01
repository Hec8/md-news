import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from '@/types';

export const useAuth = () => {
    const [firebaseUser, loading, error] = useAuthState(auth);
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        setUser(userDoc.data() as User);
                    } else {
                        // Create new user document
                        const newUser: User = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || 'Utilisateur',
                            photoURL: firebaseUser.photoURL || '',
                            isAdmin: false,
                            readArticles: [],
                            savedArticles: [],
                            createdAt: Timestamp.now(),
                        };

                        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                        setUser(newUser);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUser(null);
            }
            setUserLoading(false);
        };

        if (!loading) {
            fetchUserData();
        }
    }, [firebaseUser, loading]);

    return {
        user,
        loading: loading || userLoading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
    };
};

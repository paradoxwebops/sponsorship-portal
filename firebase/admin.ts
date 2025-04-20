// lib/firebase-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage"; // You forgot to import getStorage here!

const initFirebaseAdmin = () => {
    const apps = getApps();
    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // also needed for storage
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
};

export const { auth, db } = initFirebaseAdmin();
export const storage = getStorage(); // fix: no 'app' param needed in firebase-admin

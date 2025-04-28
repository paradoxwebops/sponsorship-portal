'use server';
import {auth,db} from "@/firebase/admin";
import {cookies} from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams){
    const { uid , name ,email }= params;

    try{
        const userRecord = await db.collection('user').doc(uid).get();

        if(userRecord.exists){
            return {
                success: false,
                message: 'User already exists . Please sign in instead.'
            }
        }

        await db.collection('user').doc(uid).set({
            name,
            email
        });


        return {
            success: true,
            message: "account created successfully."
        }


    }catch(e: any){
        console.error('Error creating a user',e);

        if(e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message:"Email already exists"
            }
        }
        return {
            success: false,
            message:'Failed to create an account'
        }
    }

}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        // 🔍 Step 1: Get user document by email
        const userQuerySnapshot = await db
            .collection("user")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (userQuerySnapshot.empty) {
            return {
                success: false,
                message: "User data not found in DB.",
            };
        }

        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data();

        if (!userData?.role) {
            return {
                success: false,
                message: "User role not assigned. Contact Admin.",
            };
        }
        // 🔐 Step 2: Set session cookie
        await setSessionCookies(idToken);

        // ✅ Step 3: Return user details (no need to check UID in Auth)
        return {
            success: true,
            message: "Signed in successfully.",
            user: {
                uid: userDoc.id, // This is Firestore doc ID (can be custom or UID)
                name: userData?.name,
                role: userData?.role,
                email: userData?.email,
            },
        };
    } catch (e) {
        console.error("🔥 SignIn Error:", e);
        return {
            success: false,
            message: "Failed to log into account",
        };
    }
}


export async function setSessionCookies(idToken: string){
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000, // milliseconds
    });


    cookieStore.set('session', sessionCookie , {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        // ✅ Get user email from claims
        const email = decodedClaims.email;
        if (!email) return null;

        // 🔍 Look up Firestore user by email
        const userQuerySnapshot = await db
            .collection("user")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (userQuerySnapshot.empty) return null;

        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data();

        return {
            ...userData,
            id: userDoc.id,
            role: userData?.role,
        } as User;
    } catch (e) {
        console.log("getCurrentUser error:", e);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;

}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
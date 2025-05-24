import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role } = await req.json();
        if (!name || !email || !password || !role) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        if (!['culturals', 'technicals', 'sports'].includes(role)) {
            return NextResponse.json({ success: false, message: 'Invalid subdepartment role' }, { status: 400 });
        }

        // Try to create user in Firebase Auth
        let user;
        try {
            user = await auth.getUserByEmail(email);
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        } catch {
            user = await auth.createUser({
                email,
                emailVerified: true,
                password,
                displayName: name,
                disabled: false,
            });
        }

        // Set custom claim
        await auth.setCustomUserClaims(user.uid, { role });

        // Add to Firestore
        const userDoc = db.collection('user').doc(user.uid);
        await userDoc.set({
            name,
            email,
            role,
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Error creating subdepartment user:', e);
        return NextResponse.json({ success: false, message: e.message || 'Internal server error' }, { status: 500 });
    }
} 
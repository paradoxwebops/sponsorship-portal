// scripts/initializeUsers.ts
import { auth, db } from '@/firebase/admin';

const predefinedUsers: Record<string, { name: string; role: Role }> = {
    'accommodation@iitmparadox.org': { name: 'Accomodation', role: 'department' },
    'finance@iitmparadox.org': { name: 'Finance', role: 'department' },
    'fr@iitmparadox.org': { name: 'FO', role: 'finance' },
    'publicrelations@iitmparadox.org': { name: 'Outreach and Hospitality', role: 'department' },
    'multimedia@iitmparadox.org': { name: 'Multimedia', role: 'department' },
    'partnership@iitmparadox.org': { name: 'Sponsorship', role: 'admin' },
    'professionals@iitmparadox.org': { name: 'Central Events', role: 'department' },
    'sales@iitmparadox.org': { name: 'Sales and Marketing', role: 'department' },
    'security@iitmparadox.org': { name: 'Security', role: 'department' },
    'studentrelations@iitmparadox.org': { name: 'Student Relations', role: 'department' },
    'webops@iitmparadox.org': { name: 'WebOps', role: 'department' },
    'secretaries@iitmparadox.org': { name: 'Secretaries', role: 'viewer' },
    'steering-committee@iitmparadox.org': { name: 'Steering Committee', role: 'viewer' },
    'culturals@iitmparadox.org': { name: 'Culturals', role: 'department' },
    'technicals@iitmparadox.org': { name: 'Tech', role: 'department' },
    'sports@iitmparadox.org': { name: 'Sports', role: 'department' },
    '22f3002811@ds.study.iitm.ac.in': { name: 'Aditya', role: 'admin' },
};

export async function initializeUsers() {
    for (const [email, { name, role }] of Object.entries(predefinedUsers)) {
        try {
            let user;

            try {
                user = await auth.getUserByEmail(email);
                console.log(`✅ User already exists: ${email}`);
            } catch {
                user = await auth.createUser({
                    email,
                    emailVerified: true,
                    password: process.env.DEFAULT_USER_PASSWORD || 'temporaryPass123',
                    displayName: name,
                    disabled: false,
                });
                console.log(`🆕 Created user: ${email}`);
            }

            // Set custom claim
            await auth.setCustomUserClaims(user.uid, { role });

            // Add to Firestore if not exists
            const userDoc = db.collection('user').doc(user.uid);
            const userSnapshot = await userDoc.get();

            if (!userSnapshot.exists) {
                await userDoc.set({
                    name,
                    email,
                    role,
                });
                console.log(`📥 Added user to Firestore: ${email}`);
            } else {
                console.log(`📎 Firestore record already exists: ${email}`);
            }
        } catch (e) {
            console.error(`❌ Error processing user ${email}`, e);
        }
    }

    console.log('🎉 User initialization complete!');
}

initializeUsers();

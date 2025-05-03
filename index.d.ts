import {Timestamp} from "firebase/firestore";

interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
}
interface SignInParams {
    email: string;
    idToken: string;
}

interface User {
    name: string;
    email: string;
    id: string;
    role: Role;
}
interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
}

type Role = 'department' | 'finance' | 'viewer' | 'admin';

interface ProofSubmission {
    userId: string;
    userName: string;
    userEmail: string;
    proofFileUrl: string;
    proofMessage: string;
    timestamp: any; // Firestore Timestamp
}


// ✅ Deliverables (subcollection of Sponsor)
interface Deliverable {
    id?: string;
    sponsorId: string;  // 🔥 New required field
    title: string;
    description: string;
    dueDate: string | Timestamp;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    proofRequired: 'image' | 'document' | 'video' | 'other';
    estimatedCost?: number;
    actualCost?: number;
    completedDate?: string | Timestamp;
    taskType: 'standard' | 'cost';
    costType?: 'posters' | 'standee' | 'banner' | 'accommodation' | 'food';
    listDepartments: MessageDepartment[];
    additionalFileUrl?: string;
    numberOfPrintable?: number;
    sizeOfPrintable?: string;
    costPerPrintable?: number;
    paymentType?: 'event' | 'custom' | 'common';
    accommodations?: Accommodation[];
    food?: Food[];
}

// 🛏️ Accommodation Details
interface Accommodation {
    costPerPerson: number;
    personName: string;
    arrivalDate: string | Timestamp;
    departureDate: string | Timestamp;
}

// 📨 Department Message Mapping
interface MessageDepartment {
    id?: string;
    userId: string;          // Refers to User.id
    userEmail: string;       // Redundant but useful for display/search
    userName: string;        // For quick access (optional, denormalized)
    message: string;
}

// 🍽️ Food for Events
interface Food {
    numberOfPeople: number;
    mealType: 'lunch' | 'breakfast' | 'dinner' | 'snacks';
    costPerPerson: number;
}

interface Proof {
    deliverableId: string;
    proofFileUrl: string;
    proofMessage: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | Timestamp;
    userEmail: string;
    userId: string;
    userName: string;
    reason?: string;
    reviewedAt?: stirng | Timestamp;
}

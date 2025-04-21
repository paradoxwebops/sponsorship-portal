// types/firebaseTypes.ts

import { Timestamp } from 'firebase/firestore';

// 🧍 Sponsor
export interface Sponsor {
    id?: string; // Firestore doc ID
    name: string;
    legalName: string;
    totalValue: number;
    cashValue: number;
    inKindValue: number;
    estimatedCost: number;
    actualCost: number | null;
    totalDeliverables: number;
    completedDeliverables: number;
    status: 'active' | 'completed' | 'pending';
    notes?: string;
    priority: 'low' | 'mid' | 'high';
    sponsorLevel: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
    sponsorType: 'cash' | 'inKind' | 'hybrid';
    inKindItems: InKindItem[];
    events: Event[];
    docUrl: string;
}

// 📦 In-Kind Item
export interface InKindItem {
    itemName: string;
    units: number;
    valuePerUnit: number;
    totalValue: number;
}

// 🎤 Events Sponsored
export interface Event {
    eventName: string;
    associationType: 'presents' | 'coPowered' | 'powered';
    departmentType: 'Tech' | 'Sports' | 'Culturals';
}

// 🏢 Departments
export interface Department {
    id?: string;
    name: string;
    email: string;
    totalAssigned: number;
    totalCompleted: number;
    onTimeRate: number;
    avgCompletionTime: number;
}

// ✅ Deliverables (subcollection of Sponsor)
export interface Deliverable {
    id?: string;
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
export interface Accommodation {
    personName: string;
    arrivalDate: string | Timestamp;
    departureDate: string | Timestamp;
}

// 📨 Department Message Mapping
export interface MessageDepartment {
    id?: string;
    userId: string;          // Refers to User.id
    userEmail: string;       // Redundant but useful for display/search
    userName: string;        // For quick access (optional, denormalized)
    message: string;
}

// 🍽️ Food for Events
export interface Food {
    numberOfPeople: number;
    mealType: 'lunch' | 'breakfast' | 'dinner' | 'snacks';
    costPerPerson: number;
}

export interface SummaryMetrics {
    totalSponsorship: number;
    cashSponsorship: number;
    inKindSponsorship: number;
    totalExpenses: number;
    overallProfitMargin: number;
    deliverableCompletionRate: number;
    avgDepartmentPerformance: number;
}

export const departments: Department[] = [
    { id: 1, name: 'Marketing', totalAssigned: 45, totalCompleted: 38, onTimeRate: 0.84, avgCompletionTime: 4.2 },
    { id: 2, name: 'Finance', totalAssigned: 20, totalCompleted: 19, onTimeRate: 0.95, avgCompletionTime: 2.8 },
    { id: 3, name: 'Events', totalAssigned: 67, totalCompleted: 52, onTimeRate: 0.78, avgCompletionTime: 5.6 },
    { id: 4, name: 'PR & Communications', totalAssigned: 31, totalCompleted: 24, onTimeRate: 0.77, avgCompletionTime: 4.9 },
    { id: 5, name: 'Digital', totalAssigned: 25, totalCompleted: 23, onTimeRate: 0.92, avgCompletionTime: 3.7 },
    { id: 6, name: 'Production', totalAssigned: 38, totalCompleted: 29, onTimeRate: 0.76, avgCompletionTime: 6.1 },
];

export const sponsors: Sponsor[] = [
    {
        id: 1,
        name: 'TechCorp Inc.',
        totalValue: 125000,
        cashValue: 100000,
        inKindValue: 25000,
        estimatedCost: 55000,
        actualCost: 52800,
        totalDeliverables: 24,
        completedDeliverables: 21,
        status: 'active',
        notes: 'Strategic tech partner for our main event'
    },
    {
        id: 2,
        name: 'Global Media Partners',
        totalValue: 85000,
        cashValue: 50000,
        inKindValue: 35000,
        estimatedCost: 32000,
        actualCost: 34500,
        totalDeliverables: 18,
        completedDeliverables: 15,
        status: 'active',
        notes: 'Media coverage and promotional support'
    },
    {
        id: 3,
        name: 'Infinite Energy',
        totalValue: 200000,
        cashValue: 175000,
        inKindValue: 25000,
        estimatedCost: 92000,
        actualCost: 88700,
        totalDeliverables: 30,
        completedDeliverables: 27,
        status: 'active',
        notes: 'Title sponsors for main stage'
    },
    {
        id: 4,
        name: 'Metro Bank',
        totalValue: 150000,
        cashValue: 150000,
        inKindValue: 0,
        estimatedCost: 65000,
        actualCost: 63200,
        totalDeliverables: 22,
        completedDeliverables: 20,
        status: 'active',
        notes: 'Financial services partner'
    },
    {
        id: 5,
        name: 'Stellar Apparel',
        totalValue: 60000,
        cashValue: 30000,
        inKindValue: 30000,
        estimatedCost: 28000,
        actualCost: 26900,
        totalDeliverables: 15,
        completedDeliverables: 12,
        status: 'active',
        notes: 'Official merchandise provider'
    },
    {
        id: 6,
        name: 'Quantum Solutions',
        totalValue: 175000,
        cashValue: 125000,
        inKindValue: 50000,
        estimatedCost: 82000,
        actualCost: null,
        totalDeliverables: 28,
        completedDeliverables: 16,
        status: 'pending',
        notes: 'Tech solutions and digital infrastructure'
    },
    {
        id: 7,
        name: 'Eco Friendly Co.',
        totalValue: 45000,
        cashValue: 25000,
        inKindValue: 20000,
        estimatedCost: 22000,
        actualCost: 21500,
        totalDeliverables: 12,
        completedDeliverables: 12,
        status: 'completed',
        notes: 'Sustainable materials provider'
    },
];

export const deliverables: Deliverable[] = [
    {
        id: 1,
        title: 'Logo Placement on Main Stage',
        description: 'Place sponsors logo prominently on the main stage backdrop.',
        sponsorId: 1,
        departmentId: 3,
        dueDate: '2023-11-15',
        status: 'completed',
        priority: 'high',
        proofRequired: 'image',
        estimatedCost: 5000,
        actualCost: 4800,
        completedDate: '2023-11-10',
        taskType: 'standard'
    },
    {
        id: 2,
        title: 'Social Media Package',
        description: '3 dedicated posts on all social media platforms.',
        sponsorId: 1,
        departmentId: 1,
        dueDate: '2023-11-20',
        status: 'in_progress',
        priority: 'medium',
        proofRequired: 'image',
        estimatedCost: 3000,
        taskType: 'standard'
    },
    {
        id: 3,
        title: 'VIP Reception Hosting',
        description: 'Exclusive hosting of the VIP reception with branding.',
        sponsorId: 3,
        departmentId: 3,
        dueDate: '2023-12-01',
        status: 'pending',
        priority: 'high',
        proofRequired: 'image',
        estimatedCost: 12000,
        taskType: 'cost',
        costType: 'food'
    },
    {
        id: 4,
        title: 'Promotional Video Production',
        description: '60-second promotional video featuring the sponsors.',
        sponsorId: 2,
        departmentId: 6,
        dueDate: '2023-10-30',
        status: 'overdue',
        priority: 'high',
        proofRequired: 'video',
        estimatedCost: 8000,
        taskType: 'standard'
    },
    {
        id: 5,
        title: 'Workshop Sponsorship',
        description: 'Branded workshop on industry innovations.',
        sponsorId: 1,
        departmentId: 4,
        dueDate: '2023-11-25',
        status: 'in_progress',
        priority: 'medium',
        proofRequired: 'document',
        estimatedCost: 6500,
        taskType: 'cost',
        costType: 'banner'
    },
];

export const summaryMetrics: SummaryMetrics = {
    totalSponsorship: 840000,
    cashSponsorship: 655000,
    inKindSponsorship: 185000,
    totalExpenses: 367600,
    overallProfitMargin: 56.24,
    deliverableCompletionRate: 0.82,
    avgDepartmentPerformance: 0.84,
};

export const getSponsorsWithMetrics = () => {
    return sponsors.map(sponsor => {
        const profitMargin = sponsor.actualCost
            ? ((sponsor.totalValue - sponsor.actualCost) / sponsor.totalValue) * 100
            : ((sponsor.totalValue - sponsor.estimatedCost) / sponsor.totalValue) * 100;

        return {
            ...sponsor,
            profitMargin: profitMargin.toFixed(2),
            completionRate: ((sponsor.completedDeliverables / sponsor.totalDeliverables) * 100).toFixed(0),
            remaining: sponsor.totalDeliverables - sponsor.completedDeliverables
        };
    });
};

export const getDepartmentsWithMetrics = () => {
    return departments.map(dept => {
        return {
            ...dept,
            remaining: dept.totalAssigned - dept.totalCompleted,
            completionRate: ((dept.totalCompleted / dept.totalAssigned) * 100).toFixed(0),
            onTimeRate: (dept.onTimeRate * 100).toFixed(0)
        };
    });
};

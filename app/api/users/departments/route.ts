// app/api/users/departments/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshot = await db
            .collection("user")
            .where("role", "in", ["department", "finance"])
            .get();

        const users = snapshot.docs.map((doc) => ({
            userId: doc.id,
            userName: doc.data().name,
            userEmail: doc.data().email,
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching department users:", error);
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}

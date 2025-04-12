import { NextResponse } from "next/server";
import {signIn} from "@/lib/actions/auth.action";

export async function POST(req: Request) {
    const { email, idToken } = await req.json();
    const result = await signIn({ email, idToken });
    return NextResponse.json(result);
}

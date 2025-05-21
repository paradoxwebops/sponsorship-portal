// app/api/setup/users/route.ts
import { initializeUsers } from '@/firebase/scripts/initializeUsers';
import { NextResponse } from 'next/server';

export async function GET() {
  await initializeUsers();
  return NextResponse.json({ success: true });
}
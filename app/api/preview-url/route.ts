// app/api/preview-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/r2'; // adjust path if it's different

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
        return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
    }

    try {
        const signedUrl = await getSignedDownloadUrl(filePath);
        return NextResponse.json({ url: signedUrl });
    } catch (err) {
        console.error('Failed to generate signed preview URL:', err);
        return NextResponse.json({ error: 'Could not generate signed URL' }, { status: 500 });
    }
}

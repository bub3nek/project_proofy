import { NextRequest, NextResponse } from 'next/server';

import { addStore, getStores } from '@/lib/stores';
import { ApiResponse } from '@/types';

export async function GET() {
    const stores = await getStores();
    return NextResponse.json<ApiResponse<typeof stores>>({
        success: true,
        data: stores,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = body?.name;
        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Store name is required' },
                { status: 400 }
            );
        }

        const store = await addStore(name);
        return NextResponse.json({
            success: true,
            data: store,
        });
    } catch (error) {
        console.error('Failed to add store', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Failed to add store' },
            { status: 500 }
        );
    }
}

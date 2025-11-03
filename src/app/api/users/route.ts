// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/withAuth';
import { isAdmin } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const nr: any = req;
    const { auth } = await requireAuth(nr);

    if (!isAdmin(auth)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(users);
  } catch (err: any) {
    const msg = err?.message ?? 'Unauthorized';
    return new NextResponse(JSON.stringify({ error: msg }), { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const nr: any = req;
    const { auth } = await requireAuth(nr);
    if (!isAdmin(auth)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await req.json();
    const created = await prisma.user.create({ data: { name: body.name, email: body.email } });
    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Unauthorized' }), { status: 401 });
  }
}

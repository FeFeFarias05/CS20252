import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/withAuth';
import { isAdmin, isSelfOrAdmin } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string }}) {
  try {
    const nr: any = req;
    const { auth } = await requireAuth(nr);
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 });

    if (!isSelfOrAdmin(auth, user.id)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Unauthorized' }), { status: 401 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const nr: any = req;
    const { auth } = await requireAuth(nr);
    if (!isSelfOrAdmin(auth, params.id)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { name: body.name, email: body.email },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Unauthorized' }), { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const nr: any = req;
    const { auth } = await requireAuth(nr);
    if (!isAdmin(auth)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id }});
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Unauthorized' }), { status: 401 });
  }
}

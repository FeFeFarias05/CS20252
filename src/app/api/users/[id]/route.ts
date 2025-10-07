import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET `/api/users/[id]` – fetch a single user by id.
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  return user
    ? NextResponse.json(user)
    : NextResponse.json({ error: 'not found' }, { status: 404 });
}

/**
 * PUT `/api/users/[id]` – update a user's name or email.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, email } = await req.json();
  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}

/**
 * DELETE `/api/users/[id]` – remove a user from the database.
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
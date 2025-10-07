import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instantiate Prisma client once per Lambda to avoid exhausting database connections.
const prisma = new PrismaClient();

/**
 * Handle GET requests to fetch all users.
 *
 * Returns a JSON array of users ordered by creation date descending.
 */
export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(users);
}

/**
 * Handle POST requests to create a new user.
 *
 * Expects a JSON body with `name` and `email`. Email must be unique.
 */
export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json(
      { error: 'name/email required' },
      { status: 400 },
    );
  }
  try {
    const user = await prisma.user.create({ data: { name, email } });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    // P2002 is the Prisma error code for unique constraint violation
    if (e.code === 'P2002') {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'internal' },
      { status: 500 },
    );
  }
}
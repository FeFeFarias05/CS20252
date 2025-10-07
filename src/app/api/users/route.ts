import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';

/**
 * Handle GET requests to fetch all users.
 *
 * Returns a JSON array of users ordered by creation date descending.
 */
export async function GET() {
  try {
    const users = await dynamoDBService.getAllClients();
    // Sort by createdAt descending
    const sortedUsers = users.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
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
    // Check if email already exists
    const existingUsers = await dynamoDBService.getAllClients();
    const emailExists = existingUsers.some(user => user.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 },
      );
    }

    const user = await dynamoDBService.createClient({ name, email });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'internal' },
      { status: 500 },
    );
  }
}
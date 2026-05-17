import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseServiceRole();

    // Update user password via Supabase Auth Admin
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('Supabase Auth Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    console.error('Update Password API Error:', err);
    return NextResponse.json({ error: (err as any).message }, { status: 500 });
  }
}

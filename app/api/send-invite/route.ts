import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, name, role, password } = await request.json();

    if (!username || !name || !password) {
      return NextResponse.json({ error: 'Usuário, nome e senha são obrigatórios' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseServiceRole();

    // Use a fixed internal domain for all users to satisfy Supabase Auth requirement
    const internalEmail = `${username.toLowerCase()}@sophis.intern`;

    // 1. Create user via Supabase Auth Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { 
        full_name: name,
        role: role,
        username: username
      }
    });

    if (authError) {
      console.error('Supabase Auth Create Error:', authError);
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este nome de usuário já está em uso.' }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Sync to team_members table for UI listing
    const { error: dbError } = await supabaseAdmin
      .from('team_members')
      .insert({
        id: authData.user.id,
        username: username,
        name: name,
        role: role,
        email: internalEmail,
        status: 'Ativo'
      });

    if (dbError) {
      console.error('Sync to team_members failed:', dbError);
      // We don't fail the whole request because the user IS created in Auth
    }

    return NextResponse.json({ 
      success: true, 
      user: authData.user 
    });
  } catch (err) {
    console.error('Create User API Error:', err);
    return NextResponse.json({ error: (err as any).message }, { status: 500 });
  }
}

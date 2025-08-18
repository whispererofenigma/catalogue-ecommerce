// app/login/actions.ts
'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createAdminClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return { error: 'Could not authenticate user. Please check your credentials.' };
  }

  // A successful login will be handled by middleware, but we can redirect here as a fallback.
  return redirect('/admin');
}

// You can use this function to initially create your admin user.
// After creating the user, you can remove or comment out the UI for it.
export async function signup(formData: FormData) {
  const supabase = await createAdminClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Signup error:', error.message);
    return { error: 'Could not sign up user.' };
  }

  return redirect('/admin');
}

export async function signOut() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  return redirect('/login');
}
/**
 * Example usage of Supabase client
 * These are just examples - copy and adapt as needed
 */

import { createClient as createBrowserClient } from './client';
import { createClient as createServerClient } from './server';

// ============================================================================
// CLIENT-SIDE EXAMPLES (use in 'use client' components)
// ============================================================================

export async function getAiToolsClient() {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('ai_tools')
    .select('*, profiles(*)')
    .order('date_uploaded', { ascending: false });

  if (error) {
    console.error('Error fetching tools:', error);
    return null;
  }

  return data;
}

export async function getAiToolsByUserClient(userId: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('user_id', userId)
    .order('date_uploaded', { ascending: false });

  if (error) {
    console.error('Error fetching user tools:', error);
    return null;
  }

  return data;
}

export async function createAiToolClient(tool: {
  tool_name: string;
  use_case: string;
  rating?: number | null;
  hashtags?: string[];
}) {
  const supabase = createBrowserClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('ai_tools')
    .insert({
      user_id: user.id,
      tool_name: tool.tool_name,
      use_case: tool.use_case,
      rating: tool.rating ?? null,
      hashtags: tool.hashtags ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tool:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// SERVER-SIDE EXAMPLES (use in Server Components or Server Actions)
// ============================================================================

export async function getAiToolsServer() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('ai_tools')
    .select('*, profiles(*)')
    .order('date_uploaded', { ascending: false });

  if (error) {
    console.error('Error fetching tools:', error);
    return null;
  }

  return data;
}

export async function getProfileServer(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

// ============================================================================
// AUTHENTICATION EXAMPLES
// ============================================================================

export async function signUpExample(email: string, password: string, username?: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
    },
  });

  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }

  return data;
}

export async function signInExample(email: string, password: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

export async function signOutExample() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUserExample() {
  const supabase = createBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

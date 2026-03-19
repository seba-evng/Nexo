import { supabase } from '../../../lib/supabaseClient'
import { LoginForm, RegisterForm } from '../schemas/authSchema'

export async function login({ email, password }: LoginForm) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function register({ email, password }: RegisterForm) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
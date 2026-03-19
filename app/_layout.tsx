import { router, Stack } from 'expo-router'
import { useEffect } from 'react'
import { supabase } from '../src/lib/supabaseClient'
import { useAuthStore } from '../src/store/authStore'

export default function RootLayout() {
  const { setUser, setProfile } = useAuthStore()

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        })
        loadProfile(session.user.id)
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        })
        loadProfile(session.user.id)
      } else {
        setUser(null)
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[chatId]" />
    </Stack>
  )
}
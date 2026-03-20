import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import { useEffect } from 'react'
import { registerForPushNotifications } from '../src/lib/notificationsService'
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

    await registerForPushNotifications(userId)
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
        router.replace('/splash' as any)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        })
        loadProfile(session.user.id)
        router.replace('/(tabs)')
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.replace('/splash' as any)
      }
    })

    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('access_token') || url.includes('token_hash')) {
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1])
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (data.session) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email!,
              created_at: data.session.user.created_at,
            })
            loadProfile(data.session.user.id)
            router.replace('/onboarding' as any)
          }
        }
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url })
    })

    const linkingSub = Linking.addEventListener('url', handleDeepLink)

    return () => {
      subscription.unsubscribe()
      linkingSub.remove()
    }
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="chat/[chatId]" />
    </Stack>
  )
}
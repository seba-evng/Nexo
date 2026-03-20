import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from './supabaseClient'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log('Las notificaciones solo funcionan en dispositivo físico')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones denegado')
    return
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mensajes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00E5FF',
      sound: 'default',
    })
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data

  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId)

  return token
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {},
    },
    trigger: null,
  })
}
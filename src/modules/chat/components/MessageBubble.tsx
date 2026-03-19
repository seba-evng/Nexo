import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { Message } from '../../../types/app.types'

type Props = {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: Props) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start()
  }, [])

  return (
    <Animated.View style={[
      styles.wrapper,
      isOwn ? styles.wrapperOwn : styles.wrapperOther,
      {
        opacity: anim,
        transform: [
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
        ]
      }
    ]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 3, marginHorizontal: 12 },
  wrapperOwn: { alignItems: 'flex-end' },
  wrapperOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn: {
    backgroundColor: '#00E5FF',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 15, lineHeight: 20 },
  textOwn: { color: '#080C14' },
  textOther: { color: '#FFFFFF' },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeOwn: { color: 'rgba(8,12,20,0.5)' },
  timeOther: { color: 'rgba(255,255,255,0.35)' },
})
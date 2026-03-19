import { useLocalSearchParams } from 'expo-router'
import VerifyEmailScreen from '../src/modules/auth/screens/VerifyEmailScreen'

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>()
  return <VerifyEmailScreen email={email} />
}
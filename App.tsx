import 'react-native-gesture-handler';
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import './src/i18n'
import Allroute from './src/navigation/AllRoute'
import { initializeNotifications } from './src/utils/notificationService'
import useLanguageStore from './src/zustand/useLanguageStore'

const App = () => {
  const { loadLanguage } = useLanguageStore()
  useEffect(() => {
    loadLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Firebase Push Notifications + Notifee ──
  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined
    let unsubscribeOpenedApp: (() => void) | undefined
    let unsubscribeTokenRefresh: (() => void) | undefined
    let unsubscribeNotifeeEvents: (() => void) | undefined

    const setup = async () => {
      try {
        const subs = await initializeNotifications(
          // Foreground notification callback (notification banner is shown via Notifee automatically)
          (notification) => {
            console.log('[App] Foreground notification:', notification.title, notification.body)
          },
          // Notification tap callback (from background/quit)
          (data) => {
            console.log('[App] Notification tapped with data:', data)
            // Handle deep-link / navigation based on data here
            // e.g. if (data.screen) { navigationRef.navigate(data.screen, data.params) }
          },
        )
        unsubscribeForeground = subs.unsubscribeForeground
        unsubscribeOpenedApp = subs.unsubscribeOpenedApp
        unsubscribeTokenRefresh = subs.unsubscribeTokenRefresh
        unsubscribeNotifeeEvents = subs.unsubscribeNotifeeEvents
      } catch (error) {
        console.log('[App] Notification setup error:', error)
      }
    }

    setup()

    return () => {
      unsubscribeForeground?.()
      unsubscribeOpenedApp?.()
      unsubscribeTokenRefresh?.()
      unsubscribeNotifeeEvents?.()
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content"  /> */}
      <Allroute />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default App

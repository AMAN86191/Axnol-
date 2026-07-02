import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal} from 'react-native'
import Allroute from './src/navigation/AllRoute'
import { PostProvider } from './src/context/PostContext'
import { withStallion, useStallionUpdate, restart, addEventListener } from 'react-native-stallion'
import LinearGradient from 'react-native-linear-gradient'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { Colors } from './src/theme/colors'

const App = () => {
  const { isRestartRequired, newReleaseBundle } = useStallionUpdate()
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  useEffect(() => {
    const subscription: any = addEventListener((event: any) => {
      if (event.type === 'DOWNLOAD_STARTED') {
        setIsDownloading(true)
        setDownloadProgress(0)
      } else if (event.type === 'DOWNLOAD_PROGRESS_PROD') {
        setIsDownloading(true)
        if (event.payload && typeof event.payload.progress === 'number') {
          setDownloadProgress(Math.round(event.payload.progress * 100))
        }
      } else if (event.type === 'DOWNLOAD_COMPLETE') {
        setIsDownloading(false)
      }
    })

    return () => {
      subscription?.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content"  /> */}
      <PostProvider>
        <Allroute />
      </PostProvider>

      {/* Downloading Banner */}
      {isDownloading && (
        <View style={styles.downloadBanner}>
          <View style={styles.bannerContent}>
            <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
            <Text style={styles.bannerText}>Downloading Update: {downloadProgress}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      )}

      {/* Restart Prompt Modal */}
      <Modal
        visible={isRestartRequired}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[Colors.primary, '#ff8a58']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Text style={styles.iconText}>✨</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Update Ready</Text>
              <Text style={styles.modalDescription}>
                A new version of the app is ready to install. Restart now to get the latest features and fixes.
              </Text>

              {newReleaseBundle?.releaseNote && (
                <View style={styles.releaseNotesContainer}>
                  <Text style={styles.releaseNotesTitle}>What's New:</Text>
                  <Text style={styles.releaseNotesContent}>{newReleaseBundle.releaseNote}</Text>
                </View>
              )}

              <TouchableOpacity activeOpacity={0.8} onPress={restart} style={styles.buttonWrapper}>
                <LinearGradient
                  colors={[Colors.primary, '#e0551b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.restartButton}
                >
                  <Text style={styles.buttonText}>Restart Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  downloadBanner: {
    position: 'absolute',
    bottom: hp(2.5),
    left: wp(5),
    right: wp(5),
    backgroundColor: Colors.white,
    borderRadius: wp(3),
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
  },
  spinner: {
    marginRight: wp(3),
  },
  bannerText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: Colors.dark,
  },
  progressBarBackground: {
    height: hp(0.5),
    backgroundColor: Colors.secondary,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 24, 0.8)', // Tinted using Colors.dark
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6),
  },
  modalContainer: {
    width: wp(85),
    maxWidth: wp(90),
    backgroundColor: Colors.white,
    borderRadius: wp(6),
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  headerGradient: {
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: RFValue(20),
  },
  modalBody: {
    padding: wp(6),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: hp(1),
  },
  modalDescription: {
    fontSize: RFValue(12),
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: RFValue(18),
    marginBottom: hp(2.5),
  },
  releaseNotesContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  releaseNotesTitle: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.gray,
    marginBottom: hp(0.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  releaseNotesContent: {
    fontSize: RFValue(12),
    color: Colors.dark,
    lineHeight: RFValue(16),
  },
  buttonWrapper: {
    width: '100%',
  },
  restartButton: {
    paddingVertical: hp(1.2),
    borderRadius: wp(3.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontWeight: '700',
  },
})

export default withStallion(App)
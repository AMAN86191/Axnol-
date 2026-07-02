import React, { useCallback, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, Share2, Download, Heart } from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Gaushala' | 'Cows' | 'Events';
  image: any;
  isLocal?: boolean;
}

export default function GalleryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const galleryData = useMemo<GalleryItem[]>(() => [
    {
      id: '1',
      title: 'Healthy Cows in Pasture',
      category: 'Gaushala',
      image: { uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600' },
    },
    {
      id: '2',
      title: 'Newborn Calf Medical Seva',
      category: 'Cows',
      image: { uri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600' },
    },
    {
      id: '3',
      title: 'Daily Green Fodder Drive',
      category: 'Events',
      image: { uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600' },
    },
    {
      id: '4',
      title: 'Morning Gaushala Prayer',
      category: 'Gaushala',
      image: require('../../../assets/images/gaushala.png'),
      isLocal: true,
    },
    {
      id: '5',
      title: 'Sponsorship Calf Care',
      category: 'Cows',
      image: require('../../../assets/images/calf.png'),
      isLocal: true,
    },
    {
      id: '6',
      title: 'Weekly Trust Seva Event',
      category: 'Events',
      image: require('../../../assets/images/event.png'),
      isLocal: true,
    },
    {
      id: '7',
      title: 'Calves Drinking Clean Water',
      category: 'Cows',
      image: { uri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600' },
    },
    {
      id: '8',
      title: 'Gaushala Shed Construction',
      category: 'Gaushala',
      image: { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600' },
    },
    {
      id: '9',
      title: 'Fodder Distribution Festival',
      category: 'Events',
      image: { uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600' },
    },
  ], []);

  const handleShare = useCallback(async (item: GalleryItem) => {
    try {
      const shareMsg = `Check out this beautiful photo from Gau Mata Trust Gallery: "${item.title}" - Join our mission!`;
      await Share.share({
        message: shareMsg,
        url: item.isLocal ? undefined : item.image.uri,
      });
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  }, []);

  const handleDownload = useCallback((item: GalleryItem) => {
    Alert.alert('Download Started', `Downloading "${item.title}" to your device gallery.`);
  }, []);

  const renderItem = ({ item, index }: { item: GalleryItem; index: number }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.9}
      onPress={() => setSelectedIndex(index)}
    >
      <Image source={item.image} style={styles.gridImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Custom Header */}
      {/* <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <ImageIcon size={RFValue(16)} color="#EA580C" />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Gallery</Text>
            <Text style={styles.headerSubtitle}>Captured moments from our Seva journey.</Text>
          </View>
        </View>

      </View> */}
      <CommonHeader title="Gallery" onBackPress={() => navigation.goBack()} />

      {/* Image Grid */}
      <FlatList
        data={galleryData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: insets.bottom + hp('15%') }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Bottom Banner */}
      <View style={[styles.floatingBannerWrapper, { bottom: insets.bottom > 0 ? insets.bottom : hp('3%') }]}>
        <View style={styles.floatingBanner}>
          <View style={styles.bannerIconWrapper}>
            <Heart size={RFValue(18)} color="#EA580C" />
          </View>
          <View style={styles.bannerTextGroup}>
            <Text style={styles.bannerTitle}>Be a Part of Our Seva</Text>
            <Text style={styles.bannerSubtitle}>Your support helps us continue{'\n'}our mission of Gau Seva.</Text>
          </View>
          <TouchableOpacity style={styles.donateBtn} onPress={() => navigation.navigate('DonateScreen' as never)}>
            <Text style={styles.donateBtnText}>Donate Now</Text>
            <Heart size={RFValue(9)} color="#FFF" fill="#FFF" style={{ marginLeft: wp('1.5%') }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lightbox Modal */}
      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedIndex(null)}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.fullScreenCloseBtn}
            onPress={() => setSelectedIndex(null)}
            activeOpacity={0.7}
          >
            <X size={RFValue(12)} color={Colors.white} />
          </TouchableOpacity>
          
          {selectedIndex !== null && (
            <FlatList
              data={galleryData}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedIndex}
              getItemLayout={(data, index) => ({
                length: wp('100%'), offset: wp('100%') * index, index
              })}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / wp('100%'));
                setSelectedIndex(newIndex);
              }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.previewContainer}>
                  <Image source={item.image} style={styles.previewImage} />
                  <View style={styles.previewDetails}>
                    <Text style={styles.previewTitle}>{item.title}</Text>
                    
                    <View style={styles.previewActionRow}>
                      <TouchableOpacity
                        style={styles.previewActionBtn}
                        onPress={() => handleShare(item)}
                        activeOpacity={0.8}
                      >
                        <Share2 size={RFValue(12)} color={Colors.white} style={{ marginRight: wp('2%') }} />
                        <Text style={styles.previewActionBtnText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.previewActionBtn, { backgroundColor: '#374151' }]}
                        onPress={() => handleDownload(item)}
                        activeOpacity={0.8}
                      >
                        <Download size={RFValue(12)} color={Colors.white} style={{ marginRight: wp('2%') }} />
                        <Text style={styles.previewActionBtnText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#FCFCFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: Colors.dark,
  },
  headerSubtitle: {
    fontSize: RFValue(8.5),
    color: '#64748B',
    marginTop: hp('0.2%'),
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: hp('0.6%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
  },
  filterText: {
    color: '#EA580C',
    fontSize: RFValue(9),
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: wp('1.5%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: '#EAEAEA',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingBannerWrapper: {
    position: 'absolute',
    left: wp('4%'),
    right: wp('4%'),
    zIndex: 10,
    marginBottom: hp('2%'),
  },
  floatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    padding: wp('4%'),
    borderRadius: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerIconWrapper: {
    marginRight: wp('3%'),
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FDE68A',
    fontSize: RFValue(11.5),
    fontWeight: '800',
    marginBottom: hp('0.3%'),
  },
  bannerSubtitle: {
    color: '#BBF7D0',
    fontSize: RFValue(8),
    lineHeight: hp('1.4%'),
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
  },
  donateBtnText: {
    color: '#FFF',
    fontSize: RFValue(9.5),
    fontWeight: '800',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('6%') : hp('3%'),
    right: wp('5%'),
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: wp('2.5%'),
    borderRadius: wp('5%'),
  },
  previewContainer: {
    width: wp('100%'),
    height: hp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: wp('100%'),
    height: hp('60%'),
    resizeMode: 'contain',
  },
  previewDetails: {
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
    paddingHorizontal: wp('5%'),
  },
  previewTitle: {
    color: Colors.white,
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewActionRow: {
    flexDirection: 'row',
  },
  previewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginRight: wp('3%'),
  },
  previewActionBtnText: {
    color: Colors.white,
    fontSize: RFValue(10),
    fontWeight: '600',
  },
});

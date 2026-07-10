import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Calendar, MapPin, Image as ImageIcon, Heart } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { galleryEvents, GalleryEvent } from '../../data/galleryData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GalleryScreen'>;

export default function GalleryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const renderEventCard = ({ item }: { item: GalleryEvent }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('EventGalleryScreen', { eventId: item.id })}
      >
        <Image source={item.coverImage} style={styles.cardImage} />
        
        <LinearGradient
          colors={['rgba(20, 24, 24, 0.1)', 'rgba(20, 24, 24, 0.85)']}
          style={styles.gradientOverlay}
        />

        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          </View>
          <View style={styles.photoCountBadge}>
            <ImageIcon size={RFValue(10)} color="#FFFFFF" style={{ marginRight: wp('1.2%') }} />
            <Text style={styles.photoCountText}>{item.photos.length} Photos</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={RFValue(10)} color="#E2E8F0" style={{ marginRight: wp('1%') }} />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MapPin size={RFValue(10)} color="#E2E8F0" style={{ marginRight: wp('1%') }} />
              <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CommonHeader title="Gallery" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={galleryEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + hp('15%') }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
        <></>
        }
      />

      {/* Floating Bottom Banner */}
      <View style={[styles.floatingBannerWrapper, { bottom: insets.bottom > 0 ? insets.bottom : hp('4%') }]}>
        <View style={styles.floatingBanner}>
          <View style={styles.bannerIconWrapper}>
            <Heart size={RFValue(18)} color="#EA580C" />
          </View>
          <View style={styles.bannerTextGroup}>
            <Text style={styles.bannerTitle}>Be a Part of Our Seva</Text>
            <Text style={styles.bannerSubtitle}>Your support helps us continue{'\n'}our mission of Gau Seva.</Text>
          </View>
          <TouchableOpacity style={styles.donateBtn} onPress={() => navigation.navigate('DonateScreen')}>
            <Text style={styles.donateBtnText}>Donate Now</Text>
            <Heart size={RFValue(9)} color="#FFF" fill="#FFF" style={{ marginLeft: wp('1.5%') }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  listContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
  },
  listHeader: {
    marginBottom: hp('2%'),
    paddingHorizontal: wp('1%'),
  },
  subtitle: {
    fontSize: RFValue(11),
    color: '#64748B',
    lineHeight: hp('2.2%'),
  },
  card: {
    height: hp('22%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    marginBottom: hp('2.5%'),
    elevation: 4,
    shadowColor: '#141818',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#EAEAEA',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('3.5%'),
    zIndex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 111, 52, 0.95)', // primary color
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1.5%'),
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: RFValue(8),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  photoCountBadge: {
    backgroundColor: 'rgba(20, 24, 24, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1.5%'),
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: RFValue(8.5),
    fontWeight: '700',
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp('4%'),
    zIndex: 1,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '800',
    lineHeight: hp('2.3%'),
    marginBottom: hp('0.8%'),
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#E2E8F0',
    fontSize: RFValue(9),
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    height: hp('1.2%'),
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: wp('2.5%'),
  },
  floatingBannerWrapper: {
    position: 'absolute',
    left: wp('4%'),
    right: wp('4%'),
    zIndex: 10,
    marginBottom: 10,
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
});


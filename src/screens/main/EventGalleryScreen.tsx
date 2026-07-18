import React, { useState, useCallback, useMemo } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, Share2, Download, Calendar, MapPin, Image as ImageIcon } from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { RootStackParamList } from '../../navigation/types';
import useHomeStore from '../../zustand/useHomeStore';

type EventGalleryScreenRouteProp = RouteProp<RootStackParamList, 'EventGalleryScreen'>;

export default function EventGalleryScreen() {
  const navigation = useNavigation();
  const route = useRoute<EventGalleryScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Retrieve current event details from dynamic store
  const events = useHomeStore(state => state.events);
  const event = useMemo(() => {
    return events.find((e: any) => e.id.toString() === eventId);
  }, [eventId, events]);

  const parsedGallery = useMemo(() => {
    if (!event || !event.gallery) return [];
    if (typeof event.gallery === 'string') {
      try { return JSON.parse(event.gallery); } catch (e) { return []; }
    }
    return Array.isArray(event.gallery) ? event.gallery : [];
  }, [event]);

  const handleShare = useCallback(async (photo: any) => {
    try {
      const shareMsg = `Check out this beautiful photo from "${event?.name}" event organized by Gau Mata Trust. Join our mission!`;
      await Share.share({
        message: shareMsg,
        url: photo.image,
      });
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  }, [event]);

  const handleDownload = useCallback((photo: any) => {
    Alert.alert('Download Started', `Downloading photo to your device gallery.`);
  }, []);

  const renderPhotoItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.9}
      onPress={() => setSelectedIndex(index)}
    >
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <CommonHeader title="Error" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CommonHeader title="Event Photos" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={parsedGallery}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderPhotoItem}
        numColumns={3}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: insets.bottom + hp('3%') }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.eventInfoCard}>
            <View style={styles.eventHeaderRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>EVENT</Text>
              </View>
            </View>

            <Text style={styles.eventTitle}>{event.name}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={RFValue(11)} color={Colors.primary} style={{ marginRight: wp('1.5%') }} />
                <Text style={styles.metaText}>{event.event_date}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <MapPin size={RFValue(11)} color={Colors.primary} style={{ marginRight: wp('1.5%') }} />
                <Text style={styles.metaText}>{event.address}</Text>
              </View>
            </View>

            {event.description ? <Text style={styles.eventDescription}>{event.description}</Text> : null}

            <View style={styles.sectionHeader}>
              <ImageIcon size={RFValue(12)} color={Colors.dark} style={{ marginRight: wp('2%') }} />
              <Text style={styles.sectionTitle}>PHOTOS ({parsedGallery.length})</Text>
            </View>
          </View>
        }
      />

      {/* Lightbox / Fullscreen Preview Modal */}
      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedIndex(null)}
      >
        <View style={styles.fullScreenOverlay}>
          {/* Header Actions */}
          <View style={[styles.lightboxHeader, { paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('3%') }]}>
            <TouchableOpacity
              style={styles.lightboxCloseBtn}
              onPress={() => setSelectedIndex(null)}
              activeOpacity={0.7}
            >
              <X size={RFValue(14)} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.lightboxIndexContainer}>
              <Text style={styles.lightboxIndexText}>
                {selectedIndex !== null ? `${selectedIndex + 1} / ${parsedGallery.length}` : ''}
              </Text>
            </View>

            <View style={{ width: wp('10%') }} />
          </View>
          
          {selectedIndex !== null && (
            <FlatList
              data={parsedGallery}
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
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: item.image }} style={styles.previewImage} />
                  <View style={[styles.previewDetails, { paddingBottom: insets.bottom + hp('3%') }]}>
                    {item.title ? <Text style={styles.previewTitle}>{item.title}</Text> : null}
                    
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: RFValue(14),
    color: Colors.gray,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
  },
  eventInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4.5%'),
    marginHorizontal: wp('1.5%'),
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FFF1EB',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    marginBottom: hp('1%'),
  },
  categoryBadge: {
    backgroundColor: '#FFF1EB',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('1.5%'),
    borderWidth: 0.5,
    borderColor: '#FFE0D3',
  },
  categoryText: {
    color: Colors.primary,
    fontSize: RFValue(8),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: Colors.dark,
    lineHeight: hp('2.6%'),
    marginBottom: hp('1.2%'),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: RFValue(9.5),
    color: '#64748B',
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: hp('1.2%'),
    backgroundColor: '#E2E8F0',
    marginHorizontal: wp('3%'),
  },
  eventDescription: {
    fontSize: RFValue(11),
    color: '#475569',
    lineHeight: hp('2.2%'),
    marginBottom: hp('2.5%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: hp('2%'),
  },
  sectionTitle: {
    fontSize: RFValue(10),
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: wp('1.2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: '#EAEAED',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#0A0C0C',
    justifyContent: 'center',
  },
  lightboxHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    zIndex: 10,
  },
  lightboxCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: wp('2.5%'),
    borderRadius: wp('5%'),
    width: wp('10%'),
    height: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxIndexContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('4%'),
  },
  lightboxIndexText: {
    color: Colors.white,
    fontSize: RFValue(10),
    fontWeight: '700',
  },
  previewContainer: {
    width: wp('100%'),
    height: hp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: wp('100%'),
    height: hp('55%'),
    resizeMode: 'contain',
  },
  previewDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('4%'),
    backgroundColor: 'rgba(10, 12, 12, 0.75)',
  },
  previewTitle: {
    color: Colors.white,
    fontSize: RFValue(13.5),
    fontWeight: '700',
    lineHeight: hp('2.2%'),
    marginBottom: hp('2%'),
  },
  previewActionRow: {
    flexDirection: 'row',
    marginBottom: hp('1%'),
  },
  previewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
    marginRight: wp('3%'),
  },
  previewActionBtnText: {
    color: Colors.white,
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
});

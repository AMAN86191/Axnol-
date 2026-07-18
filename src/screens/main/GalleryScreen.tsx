import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  Heart,
  Clock,
  Bell,
  ChevronRight,
  Users,
  CheckCircle,
} from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import useHomeStore from '../../zustand/useHomeStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GalleryScreen'>;

// Helper to format date nicely
const formatEventDate = (dateStr: string): { formatted: string; dayName: string } => {
  if (!dateStr) return { formatted: '', dayName: '' };
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    return { formatted: `${day} ${month} ${year}`, dayName };
  } catch {
    return { formatted: dateStr, dayName: '' };
  }
};

// Helper to calculate days until event
const getDaysUntil = (dateStr: string) => {
  if (!dateStr) return 0;
  try {
    const eventDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = eventDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export default function GalleryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const events = useHomeStore(state => state.events);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const upcomingEvents = useMemo(() => {
    return events.filter((e: any) => e.event_date >= today);
  }, [events, today]);

  const pastEvents = useMemo(() => {
    return events.filter((e: any) => e.event_date < today);
  }, [events, today]);

  // Render the large upcoming event card
  const renderUpcomingCard = (item: any) => {
    const dateInfo = formatEventDate(item.event_date);
    const daysUntil = getDaysUntil(item.event_date);
    const coverImageUri = item.gallery && item.gallery.length > 0 ? item.gallery[0].image : '';

    return (
      <View style={styles.upcomingCard} key={item.id}>
        {/* Decorative leaf/image on right */}
        {coverImageUri ? (
          <Image
            source={{ uri: coverImageUri }}
            style={styles.upcomingCoverImage}
          />
        ) : null}

        {/* Badge */}
        <View style={styles.upcomingBadge}>
          <Calendar size={RFValue(9)} color="#166534" style={{ marginRight: wp('1%') }} />
          <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
        </View>

        {/* Event Name */}
        <Text style={styles.upcomingTitle} numberOfLines={2}>{item.name}</Text>

        {/* Description if available */}
        {item.description ? (
          <Text style={styles.upcomingDescription} numberOfLines={2}>{item.description}</Text>
        ) : (
          <Text style={styles.upcomingDescription} numberOfLines={2}>
            Don't miss this upcoming event by Gau Mata Trust.
          </Text>
        )}

        {/* Date */}
        <View style={styles.upcomingMetaRow}>
          <Calendar size={RFValue(12)} color="#166534" />
          <View style={{ marginLeft: wp('2%') }}>
            <Text style={styles.upcomingMetaTitle}>{dateInfo.formatted}</Text>
            {dateInfo.dayName ? <Text style={styles.upcomingMetaSub}>{dateInfo.dayName}</Text> : null}
          </View>
        </View>

        {/* Location */}
        <View style={styles.upcomingMetaRow}>
          <MapPin size={RFValue(12)} color="#166534" />
          <View style={{ marginLeft: wp('2%') }}>
            <Text style={styles.upcomingMetaTitle}>{item.address || 'TBD'}</Text>
          </View>
        </View>

        {/* Bottom row: Starts in X Days + Notify Me */}
        <View style={styles.upcomingBottomRow}>
          <View style={styles.startsInContainer}>
            <Clock size={RFValue(12)} color="#166534" style={{ marginRight: wp('1.5%') }} />
            <View>
              <Text style={styles.startsInLabel}>Starts in</Text>
              <Text style={styles.startsInValue}>{daysUntil > 0 ? `${daysUntil} Days` : 'Today'}</Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.notifyBtn} activeOpacity={0.8}>
            <Bell size={RFValue(11)} color="#FFF" style={{ marginRight: wp('1.5%') }} />
            <Text style={styles.notifyBtnText}>Notify Me</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  // Render the compact past event card
  const renderPastCard = (item: any) => {
    const gallery = Array.isArray(item.gallery) ? item.gallery : [];
    const coverImageUri = gallery.length > 0 ? gallery[0].image : '';
    const thumbnails = gallery.slice(1, 4);
    const extraCount = gallery.length > 4 ? gallery.length - 4 : 0;
    const dateInfo = formatEventDate(item.event_date);
    const photoCount = gallery.length;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.pastCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('EventGalleryScreen', { eventId: item.id.toString() })}
      >
        {/* Left side: Cover + Thumbnails */}
        <View style={styles.pastImageSection}>
          {coverImageUri ? (
            <Image source={{ uri: coverImageUri }} style={styles.pastCoverImage} />
          ) : (
            <View style={[styles.pastCoverImage, { backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center' }]}>
              <ImageIcon size={RFValue(20)} color="#94A3B8" />
            </View>
          )}
          {/* Thumbnails row */}
          <View style={styles.thumbnailRow}>
            {thumbnails.map((thumb: any, idx: number) => (
              <Image key={thumb.id || idx} source={{ uri: thumb.image }} style={styles.thumbnailImage} />
            ))}
            {extraCount > 0 && (
              <View style={styles.extraCountBadge}>
                <Text style={styles.extraCountText}>+{extraCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right side: Event Info */}
        <View style={styles.pastInfoSection}>
          {/* Completed badge */}
          <View style={styles.completedBadge}>
            <CheckCircle size={RFValue(9)} color="#166534" style={{ marginRight: wp('1%') }} />
            <Text style={styles.completedBadgeText}>COMPLETED</Text>
          </View>

          <Text style={styles.pastTitle} numberOfLines={2}>{item.name}</Text>

          <View style={styles.pastMetaRow}>
            <Calendar size={RFValue(10)} color="#6B7280" />
            <Text style={styles.pastMetaText}>{dateInfo.formatted}</Text>
          </View>

          <View style={styles.pastMetaRow}>
            <MapPin size={RFValue(10)} color="#6B7280" />
            <Text style={styles.pastMetaText} numberOfLines={1}>{item.address || 'N/A'}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.pastStatsRow}>
            <View style={styles.pastStatItem}>
              <ImageIcon size={RFValue(10)} color="#6B7280" style={{ marginRight: wp('1%') }} />
              <Text style={styles.pastStatValue}>{photoCount}</Text>
              <Text style={styles.pastStatLabel}>Photos</Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.pastArrow}>
            <ChevronRight size={RFValue(14)} color="#D1D5DB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (activeTab === 'upcoming') {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + hp('15%') }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Calendar size={RFValue(14)} color="#166534" style={{ marginRight: wp('2%') }} />
              <View>
                <Text style={styles.sectionTitle}>Upcoming Event</Text>
                <Text style={styles.sectionSubtitle}>Don't miss our next big event</Text>
              </View>
            </View>
          </View>

          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => renderUpcomingCard(event))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={RFValue(30)} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Upcoming Events</Text>
              <Text style={styles.emptySubtitle}>Check back soon for new events!</Text>
            </View>
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + hp('15%') }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <CheckCircle size={RFValue(14)} color="#166534" style={{ marginRight: wp('2%') }} />
            <View>
              <Text style={styles.sectionTitle}>Past Events</Text>
              <Text style={styles.sectionSubtitle}>Moments we are proud of</Text>
            </View>
          </View>
        </View>

        {pastEvents.length > 0 ? (
          pastEvents.map((event: any) => renderPastCard(event))
        ) : (
          <View style={styles.emptyState}>
            <ImageIcon size={RFValue(30)} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Past Events</Text>
            <Text style={styles.emptySubtitle}>Events will appear here after they're completed.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CommonHeader title="Events" onBackPress={() => navigation.goBack()} />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming Events ({upcomingEvents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past Events ({pastEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

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

  // ── Tab Bar ──
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#166534',
  },
  tabText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#166534',
    fontWeight: '700',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: RFValue(13),
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: RFValue(9),
    color: '#9CA3AF',
    marginTop: hp('0.2%'),
  },

  // ── Upcoming Card ──
  upcomingCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    borderWidth: 1,
    borderColor: '#BBF7D0',
    position: 'relative',
    overflow: 'hidden',
  },
  upcomingCoverImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: wp('35%'),
    height: '100%',
    opacity: 0.15,
    resizeMode: 'cover',
    borderTopRightRadius: wp('5%'),
    borderBottomRightRadius: wp('5%'),
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  upcomingBadgeText: {
    fontSize: RFValue(8),
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  upcomingTitle: {
    fontSize: RFValue(17),
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: hp('0.5%'),
  },
  upcomingDescription: {
    fontSize: RFValue(10),
    color: '#6B7280',
    lineHeight: hp('2%'),
    marginBottom: hp('1.5%'),
    maxWidth: '65%',
  },
  upcomingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  upcomingMetaTitle: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#1F2937',
  },
  upcomingMetaSub: {
    fontSize: RFValue(9),
    color: '#6B7280',
    marginTop: hp('0.1%'),
  },
  upcomingBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  startsInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startsInLabel: {
    fontSize: RFValue(8),
    color: '#6B7280',
  },
  startsInValue: {
    fontSize: RFValue(14),
    fontWeight: '900',
    color: '#166534',
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('3%'),
    elevation: 3,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  notifyBtnText: {
    color: '#FFF',
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },

  // ── Past Event Card ──
  pastCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pastImageSection: {
    width: wp('35%'),
    padding: wp('2.5%'),
  },
  pastCoverImage: {
    width: '100%',
    height: hp('10%'),
    borderRadius: wp('2.5%'),
    resizeMode: 'cover',
  },
  thumbnailRow: {
    flexDirection: 'row',
    marginTop: hp('0.8%'),
    gap: wp('1%'),
  },
  thumbnailImage: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('1.5%'),
    resizeMode: 'cover',
  },
  extraCountBadge: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraCountText: {
    color: '#FFF',
    fontSize: RFValue(8),
    fontWeight: '800',
  },
  pastInfoSection: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    paddingRight: wp('3%'),
    paddingLeft: wp('1%'),
    position: 'relative',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.35%'),
    borderRadius: wp('3%'),
    marginBottom: hp('0.6%'),
  },
  completedBadgeText: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
    color: '#166534',
  },
  pastTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: hp('0.5%'),
  },
  pastMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.4%'),
  },
  pastMetaText: {
    fontSize: RFValue(9),
    color: '#6B7280',
    marginLeft: wp('1.5%'),
    fontWeight: '500',
  },
  pastStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  pastStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  pastStatValue: {
    fontSize: RFValue(10),
    fontWeight: '800',
    color: '#1F2937',
    marginRight: wp('1%'),
  },
  pastStatLabel: {
    fontSize: RFValue(8),
    color: '#9CA3AF',
  },
  pastArrow: {
    position: 'absolute',
    right: wp('3%'),
    top: '50%',
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp('8%'),
  },
  emptyTitle: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#6B7280',
    marginTop: hp('1.5%'),
  },
  emptySubtitle: {
    fontSize: RFValue(10),
    color: '#9CA3AF',
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },

  // ── Floating Banner ──
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

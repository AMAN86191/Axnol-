import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../theme/colors';
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  Heart,
  Clock,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import { CommonHeader } from '../../components/CommonHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import useHomeStore from '../../zustand/useHomeStore';
import { useTranslation } from 'react-i18next';

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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = eventDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export default function GalleryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const events = useHomeStore(state => state.events);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

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
          <Calendar size={RFValue(9)} color={Colors.primary} style={{ marginRight: wp('1%') }} />
          <Text style={styles.upcomingBadgeText}>{t('gallery.upcoming')}</Text>
        </View>

        {/* Event Name */}
        <Text style={styles.upcomingTitle} numberOfLines={2}>{item.name}</Text>

        {/* Description if available */}
        {item.description ? (
          <Text style={styles.upcomingDescription} numberOfLines={2}>{item.description}</Text>
        ) : (
          <Text style={styles.upcomingDescription} numberOfLines={2}>
            {t('gallery.upcomingEventDesc')}
          </Text>
        )}

        {/* Date */}
        <View style={styles.upcomingMetaRow}>
          <Calendar size={RFValue(12)} color={Colors.primary} />
          <View style={{ marginLeft: wp('2%') }}>
            <Text style={styles.upcomingMetaTitle}>{dateInfo.formatted}</Text>
            {dateInfo.dayName ? <Text style={styles.upcomingMetaSub}>{dateInfo.dayName}</Text> : null}
          </View>
        </View>

        {/* Location */}
        <View style={styles.upcomingMetaRow}>
          <MapPin size={RFValue(12)} color={Colors.primary} />
          <View style={{ marginLeft: wp('2%') }}>
            <Text style={styles.upcomingMetaTitle}>{item.address || t('gallery.tbd')}</Text>
          </View>
        </View>

        {/* Bottom row: Starts in X Days + Notify Me */}
        <View style={styles.upcomingBottomRow}>
          <View style={styles.startsInContainer}>
            <Clock size={RFValue(12)} color={Colors.primary} style={{ marginRight: wp('1.5%') }} />
            <View>
              <Text style={styles.startsInLabel}>{t('gallery.startsIn')}</Text>
              <Text style={styles.startsInValue}>{daysUntil === 0 ? t('gallery.today') : daysUntil === 1 ? t('gallery.tomorrow') : t('gallery.days', { days: daysUntil })}</Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.notifyBtn} activeOpacity={0.8}>
            <Bell size={RFValue(11)} color={Colors.white} style={{ marginRight: wp('1.5%') }} />
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
            <View style={[styles.pastCoverImage, { backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' }]}>
              <ImageIcon size={RFValue(20)} color={Colors.lightGray} />
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
            <CheckCircle size={RFValue(9)} color={Colors.primary} style={{ marginRight: wp('1%') }} />
            <Text style={styles.completedBadgeText}>{t('gallery.completed')}</Text>
          </View>

          <Text style={styles.pastTitle} numberOfLines={2}>{item.name}</Text>

          <View style={styles.pastMetaRow}>
            <Calendar size={RFValue(10)} color={Colors.gray} />
            <Text style={styles.pastMetaText}>{dateInfo.formatted}</Text>
          </View>

          <View style={styles.pastMetaRow}>
            <MapPin size={RFValue(10)} color={Colors.gray} />
            <Text style={styles.pastMetaText} numberOfLines={1}>{item.address || t('common.na')}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.pastStatsRow}>
            <View style={styles.pastStatItem}>
              <ImageIcon size={RFValue(10)} color={Colors.gray} style={{ marginRight: wp('1%') }} />
              <Text style={styles.pastStatValue}>{photoCount}</Text>
              <Text style={styles.pastStatLabel}>{t('gallery.photos')}</Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.pastArrow}>
            <ChevronRight size={RFValue(14)} color={Colors.border} />
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
              <Calendar size={RFValue(14)} color={Colors.primary} style={{ marginRight: wp('2%') }} />
              <View>
                <Text style={styles.sectionTitle}>{t('gallery.upcomingEvent')}</Text>
                <Text style={styles.sectionSubtitle}>{t('gallery.upcomingEventDesc')}</Text>
              </View>
            </View>
          </View>

          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => renderUpcomingCard(event))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={RFValue(30)} color={Colors.border} />
              <Text style={styles.emptyTitle}>{t('gallery.noUpcomingEvents')}</Text>
              <Text style={styles.emptySubtitle}>{t('gallery.checkBackSoon')}</Text>
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
            <CheckCircle size={RFValue(14)} color={Colors.primary} style={{ marginRight: wp('2%') }} />
            <View>
              <Text style={styles.sectionTitle}>{t('gallery.pastEvents')}</Text>
              <Text style={styles.sectionSubtitle}>{t('gallery.pastEventsSubtitle')}</Text>
            </View>
          </View>
        </View>

        {pastEvents.length > 0 ? (
          pastEvents.map((event: any) => renderPastCard(event))
        ) : (
          <View style={styles.emptyState}>
            <ImageIcon size={RFValue(30)} color={Colors.border} />
            <Text style={styles.emptyTitle}>{t('gallery.noPastEvents')}</Text>
            <Text style={styles.emptySubtitle}>{t('gallery.eventsAppear')}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CommonHeader title={t('gallery.eventsTitle')} onBackPress={() => navigation.goBack()} />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            {t('gallery.upcomingEventsCount', { count: upcomingEvents.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            {t('gallery.pastEventsCount', { count: pastEvents.length })}
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      {/* Floating Bottom Banner */}
      <View style={[styles.floatingBannerWrapper, { bottom: insets.bottom > 0 ? insets.bottom : hp('4%') }]}>
        <View style={styles.floatingBanner}>
          <View style={styles.bannerIconWrapper}>
            <Heart size={RFValue(18)} color={Colors.primary} />
          </View>
          <View style={styles.bannerTextGroup}>
            <Text style={styles.bannerTitle}>{t('gallery.bePartOfSeva')}</Text>
            <Text style={styles.bannerSubtitle}>{t('gallery.sevaSubtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.donateBtn} onPress={() => navigation.navigate('DonateScreen')}>
            <Text style={styles.donateBtnText}>{t('drawer.donateNow')}</Text>
            <Heart size={RFValue(9)} color={Colors.white} fill={Colors.white} style={{ marginLeft: wp('1.5%') }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Tab Bar ──
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.lightGray,
  },
  tabTextActive: {
    color: Colors.primary,
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
    color: Colors.dark,
  },
  sectionSubtitle: {
    fontSize: RFValue(9),
    color: Colors.lightGray,
    marginTop: hp('0.2%'),
  },

  // ── Upcoming Card ──
  upcomingCard: {
    backgroundColor: '#FFF8F5',
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    borderWidth: 1,
    borderColor: '#FFE0D3',
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
    backgroundColor: '#FFF1EB',
    alignSelf: 'flex-start',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  upcomingBadgeText: {
    fontSize: RFValue(8),
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  upcomingTitle: {
    fontSize: RFValue(17),
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
  },
  upcomingDescription: {
    fontSize: RFValue(10),
    color: Colors.gray,
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
    color: Colors.dark,
  },
  upcomingMetaSub: {
    fontSize: RFValue(9),
    color: Colors.gray,
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
    color: Colors.gray,
  },
  startsInValue: {
    fontSize: RFValue(14),
    fontWeight: '900',
    color: Colors.primary,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('3%'),
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  notifyBtnText: {
    color: Colors.white,
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },

  // ── Past Event Card ──
  pastCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondary,
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
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraCountText: {
    color: Colors.white,
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
    backgroundColor: '#FFF1EB',
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.35%'),
    borderRadius: wp('3%'),
    marginBottom: hp('0.6%'),
  },
  completedBadgeText: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
    color: Colors.primary,
  },
  pastTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
  },
  pastMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.4%'),
  },
  pastMetaText: {
    fontSize: RFValue(9),
    color: Colors.gray,
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
    color: Colors.dark,
    marginRight: wp('1%'),
  },
  pastStatLabel: {
    fontSize: RFValue(8),
    color: Colors.lightGray,
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
    color: Colors.gray,
    marginTop: hp('1.5%'),
  },
  emptySubtitle: {
    fontSize: RFValue(10),
    color: Colors.lightGray,
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
    backgroundColor: Colors.dark,
    padding: wp('4%'),
    borderRadius: wp('4%'),
    shadowColor: Colors.dark,
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
    color: Colors.primary,
    fontSize: RFValue(11.5),
    fontWeight: '800',
    marginBottom: hp('0.3%'),
  },
  bannerSubtitle: {
    color: Colors.lightGray,
    fontSize: RFValue(8),
    lineHeight: hp('1.4%'),
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
  },
  donateBtnText: {
    color: Colors.white,
    fontSize: RFValue(9.5),
    fontWeight: '800',
  },
});

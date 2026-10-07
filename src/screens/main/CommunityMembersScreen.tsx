import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Bell, ChevronRight, MapPin, ShieldCheck, UserPlus, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import useHomeStore from '../../zustand/useHomeStore';
import { CommonHeader } from '../../components/CommonHeader';

export type MemberRole = 'Trustee' | 'General';

export interface CommunityMemberUI {
  id: string;
  name: string;
  role: MemberRole;
  location: string;
  profilePic: string;
  color: string;
  designation: string;
}

// API ka `designation` tier batata hai (Gold / Platinum / Silver).
// Sirf inhi tier values ke liye premium styling lagate hain, baaki simple.
type TierKey = 'gold' | 'platinum' | 'silver';

interface TierBadgeConfig {
  label: string;
  bg: string;
  border: string;
  text: string;
  avatarBg: string;
  avatarBorder: string;
  avatarText: string;
}

const TIER_BADGE: Record<TierKey, TierBadgeConfig> = {
  gold: {
    label: 'Gold',
    bg: '#FFF0B5',
    border: '#F6C659',
    text: '#925B00',
    avatarBg: '#FFFBEB',
    avatarBorder: '#E6B325',
    avatarText: '#B47700',
  },
  platinum: {
    label: 'Platinum',
    bg: '#E9D5FF',
    border: '#C084FC',
    text: '#6B21A8',
    avatarBg: '#FAF5FF',
    avatarBorder: '#A855F7',
    avatarText: '#7E22CE',
  },
  silver: {
    label: 'Silver',
    bg: '#E2E8F0',
    border: '#CBD5E1',
    text: '#334155',
    avatarBg: '#F8FAFC',
    avatarBorder: '#94A3B8',
    avatarText: '#475569',
  },
};

const getTierKey = (designation?: string | null): TierKey | null => {
  const d = designation ? String(designation).trim().toLowerCase() : '';
  if (!d) return null;
  if (d.includes('gold')) return 'gold';
  if (d.includes('platinum')) return 'platinum';
  if (d.includes('silver')) return 'silver';
  return null;
};

const COMMUNITY_COLORS = [
  '#FF6F34', '#E07B00', '#8B5A2B', '#C2410C', '#B45309', '#9A3412', '#D97706', '#EA580C', '#A85D00', '#C15F3C',
];

const getFullImageUrl = (path?: string | null) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://gst.tambimotors.com/${trimmed}`;
};

const isTrusteeRole = (membership?: string | null): boolean => {
  if (!membership) return false;
  const d = String(membership).trim().toLowerCase();
  if (!d) return false;
  return d === 'trustee' || d === 'admin' || d === 'trustee_member' || d === 'trustee member';
};

const normalizeLocation = (location?: string | null): string => {
  const l = location ? String(location).trim() : '';
  return l.length > 0 ? l : '';
};

const getInitials = (name?: string | null): string => {
  const n = name ? String(name).trim() : '';
  if (!n) return '?';
  return n
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

type TabKey = 'trustee' | 'general';

const TAB_BAR_SPACE = hp('12.5%');

const CommunityMembersScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const communityMembersStore = useHomeStore((state: any) => state.communityMembersStore);
  const getNotificationsStore = useHomeStore((state: any) => state.getNotificationsStore);

  const [allMembers, setAllMembers] = useState<CommunityMemberUI[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getNotificationsStore();
      const items = response?.notifications || response?.data || [];
      if (Array.isArray(items)) {
        setUnreadCount(items.filter((n: any) => !(n?.is_read || n?.read)).length);
      }
    } catch (err) {
      console.log('Error fetching unread count:', err);
    }
  }, [getNotificationsStore]);

  useEffect(() => {
    fetchUnreadCount();
    const unsubscribe = navigation.addListener('focus', fetchUnreadCount);
    return unsubscribe;
  }, [navigation, fetchUnreadCount]);

  const openNotifications = useCallback(() => {
    navigation.navigate('NotificationScreen');
  }, [navigation]);

  const hasFloatingTabBar = useNavigationState(
    (state) => state.routes[state.index]?.name === 'CommunityMembers',
  );

  const listBottomPadding = hasFloatingTabBar ? TAB_BAR_SPACE : hp('3%');

  // counts.member — API se seedha, pehle KPI card (Members) ke liye.
  const memberCountFromApi = useMemo(() => {
    if (rawResponse?.counts?.member != null) return Number(rawResponse.counts.member) || 0;
    if (rawResponse?.counts?.members != null) return Number(rawResponse.counts.members) || 0;
    if (rawResponse?.counts?.total != null) return Number(rawResponse.counts.total) || 0;
    return allMembers.filter((m) => m.role === 'General').length;
  }, [rawResponse, allMembers]);

  // counts.trustee — API se seedha, dusre KPI card (Trustees) ke liye.
  const trusteeCountFromApi = useMemo(() => {
    if (rawResponse?.counts?.trustee != null) return Number(rawResponse.counts.trustee) || 0;
    if (rawResponse?.counts?.trustees != null) return Number(rawResponse.counts.trustees) || 0;
    return allMembers.filter((m) => m.role === 'Trustee').length;
  }, [rawResponse, allMembers]);

  const fetchMembers = useCallback(
    async ({ showLoading = true } = {}) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const response = await communityMembersStore();
        console.log('response :', response);
        setRawResponse(response);
        const apiMembers = response?.data || response?.members || [];
        if (Array.isArray(apiMembers)) {
          const mapped: CommunityMemberUI[] = apiMembers.map((item: any, index: number) => {
            const role: MemberRole = isTrusteeRole(item?.membership) ? 'Trustee' : 'General';
            const loc = normalizeLocation(item?.location || item?.user_profile?.location);
            const city = item?.city || item?.user_profile?.city || '';
            const state = item?.state || item?.user_profile?.state || '';
            const combined = [loc, city, state].filter(Boolean).join(', ');
            const profilePic = getFullImageUrl(
              item?.profile_pic || item?.user_profile?.profile_pic || item?.avatar,
            );
            return {
              id: String(item?.id ?? index),
              name: item?.name || 'Member',
              role,
              location: combined || loc || '',
              profilePic,
              designation: item?.designation || '',
              color: COMMUNITY_COLORS[index % COMMUNITY_COLORS.length],
            };
          });
          setAllMembers(mapped);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load members');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [communityMembersStore],
  );

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMembers({ showLoading: false });
  }, [fetchMembers]);

  const onRetry = useCallback(() => {
    fetchMembers({ showLoading: true });
  }, [fetchMembers]);

  const onJoinMembers = useCallback(() => {
    navigation.navigate('JoinMembershipScreen');
  }, [navigation]);

  const onOpenProfile = useCallback((userId: string) => {
    navigation.navigate('PublicProfileScreen', { userId });
  }, [navigation]);

  const filteredList = useMemo(() => {
    if (activeTab === 'trustee') {
      return allMembers.filter((m) => m.role === 'Trustee');
    }
    return allMembers.filter((m) => m.role === 'General');
  }, [allMembers, activeTab]);

  const trusteeCountDisplay = trusteeCountFromApi;
  const memberCountDisplay = memberCountFromApi;

  const renderSkeleton = () => (
    <View>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={`skeleton-${i}`} style={styles.memberCard}>
          <View style={[styles.avatarCircle, styles.skeletonBlock]} />
          <View style={styles.memberBody}>
            <View style={[styles.skeletonText, styles.skeletonTitle]} />
            <View style={[styles.skeletonText, styles.skeletonSub]} />
          </View>
          <View style={[styles.chevronCircle, styles.skeletonBlock]} />
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: CommunityMemberUI }) => {
    const initials = getInitials(item.name);
    const hasLocation = Boolean(item.location && item.location.length > 0);
    const address = hasLocation ? item.location : t('communityMembers.notAvailable', 'Not available');
    const tierKey = getTierKey(item.designation);
    const tierStyle = tierKey ? TIER_BADGE[tierKey] : null;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.memberCard}
        onPress={() => onOpenProfile(item.id)}
      >
        {/* Avatar Ring */}
        <View
          style={[
            styles.avatarRing,
            tierStyle
              ? { borderColor: tierStyle.avatarBorder, borderWidth: 3.5, padding: 2 }
              : styles.avatarRingNormal,
          ]}
        >
          <View
            style={[
              styles.avatarCircle,
              tierStyle ? { backgroundColor: tierStyle.avatarBg } : styles.avatarCircleNormal,
            ]}
          >
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text
                style={[
                  styles.avatarInitials,
                  tierStyle ? { color: tierStyle.avatarText } : styles.avatarInitialsNormal,
                ]}
              >
                {initials}
              </Text>
            )}
          </View>
        </View>

        {/* Member Info */}
        <View style={styles.memberBody}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
            {tierStyle ? (
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
                ]}
              >
                <Text style={[styles.tierBadgeText, { color: tierStyle.text }]}>
                  {tierStyle.label}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.addressRow}>
            <MapPin size={RFValue(8.5)} color="#9CA3AF" strokeWidth={2.2} />
            <Text style={styles.memberAddress} numberOfLines={1}>{address}</Text>
          </View>
        </View>

        {/* Chevron Circle */}
        <View style={styles.chevronCircle}>
          <ChevronRight size={RFValue(11)} color="#6B7280" strokeWidth={2.4} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Users size={RFValue(18)} color={Colors.primary} strokeWidth={1.9} />
      </View>
      <Text style={styles.emptyText}>{t('communityMembers.noMembers')}</Text>
      <Text style={styles.emptySubText}>{t('communityMembers.noMembersSubtitle')}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{error || 'Something went wrong'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
        <ChevronRight size={RFValue(12)} color="#FFF" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <CommonHeader
        onBackPress={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            style={styles.notifBtn}
            activeOpacity={0.8}
            onPress={openNotifications}
          >
            <Bell size={RFValue(14)} color={Colors.primary} strokeWidth={2.2} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <FlatList
        data={loading ? [] : filteredList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: listBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={loading ? renderSkeleton : error ? renderError : renderEmpty}
        ListHeaderComponent={
          <View>
            {/* Top Header Row (Image 3) */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.orangeBar} />
                <View style={styles.headerTitleWrap}>
                  <Text style={styles.headerTitle}>
                    {t('communityMembers.members', 'Members')}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {t('communityMembers.ourGrowingFamily', 'Our growing family')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.joinBtnHeader}
                activeOpacity={0.8}
                onPress={onJoinMembers}
              >
                <UserPlus size={RFValue(11)} color={Colors.primary} strokeWidth={2.4} />
                <Text style={styles.joinBtnHeaderText}>
                  {t('communityMembers.joinMembers', 'Join Membership')}
                </Text>
                <ChevronRight size={RFValue(10)} color={Colors.primary} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* API Stat / KPI Cards (Image 2) */}
            <View style={styles.kpiRow}>
              {/* Members Card — counts.member (API) */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiIconWrapPeach}>
                  <Users size={RFValue(13)} color="#EA580C" strokeWidth={2.2} />
                </View>
                <View style={styles.kpiTextWrap}>
                  <Text style={styles.kpiValueOrange}>{memberCountDisplay}</Text>
                  <Text style={styles.kpiLabel} numberOfLines={1}>
                    {t('communityMembers.totalMembers', 'Members')}
                  </Text>
                </View>
              </View>

              {/* Trustees Card — counts.trustee (API) */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiIconWrapGreen}>
                  <ShieldCheck size={RFValue(13)} color="#10B981" strokeWidth={2.2} />
                </View>
                <View style={styles.kpiTextWrap}>
                  <Text style={styles.kpiValueGreen}>{trusteeCountDisplay}</Text>
                  <Text style={styles.kpiLabel} numberOfLines={1}>
                    {t('communityMembers.trustees', 'Trustees')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tabs Row (Image 1) */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'trustee' && styles.tabActive]}
                onPress={() => setActiveTab('trustee')}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, activeTab === 'trustee' && styles.tabTextActive]}>
                  {t('communityMembers.trusteeMembersTab', 'Trustees')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'general' && styles.tabActive]}
                onPress={() => setActiveTab('general')}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>
                  {t('communityMembers.generalMembersTab', 'General')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default CommunityMembersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingHorizontal: wp('3.5%'),
    paddingTop: hp('1.5%'),
  },

  /* ---- Header notification bell ---- */
  notifBtn: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2%'),
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -wp('1.2%'),
    right: -wp('1.2%'),
    minWidth: wp('4.6%'),
    height: wp('4.6%'),
    borderRadius: wp('2.3%'),
    backgroundColor: '#EF4444',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('0.8%'),
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(6.5),
    fontWeight: '800',
    lineHeight: RFValue(9),
  },

  /* ---- Header Row (Image 3) ---- */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.8%'),
    paddingHorizontal: wp('0.5%'),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeBar: {
    width: 4.5,
    height: hp('3.2%'),
    backgroundColor: '#EA580C',
    borderRadius: 3,
    marginRight: wp('2.5%'),
  },
  headerTitleWrap: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: RFValue(9.5),
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: hp('0.1%'),
  },
  joinBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: wp('6%'),
    paddingVertical: hp('0.7%'),
    paddingHorizontal: wp('3%'),
    gap: wp('1.2%'),
  },
  joinBtnHeaderText: {
    color: Colors.primary,
    fontSize: RFValue(9.2),
    fontWeight: '700',
  },

  /* ---- KPI Cards (Image 2) ---- */
  kpiRow: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginBottom: hp('1.8%'),
  },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4.5%'),
    paddingVertical: hp('1.4%'),
    paddingHorizontal: wp('3%'),
    borderWidth: 1,
    borderColor: '#EFF1F5',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,

    elevation: 2,
  },
  kpiIconWrapPeach: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#FFF2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconWrapGreen: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTextWrap: {
    flex: 1,
    marginLeft: wp('3%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  kpiValueOrange: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: '#C2410C',
  },
  kpiValueGreen: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: '#059669',
  },
  kpiLabel: {
    fontSize: RFValue(9),
    fontWeight: '600',
    color: '#4B5563',
    marginTop: hp('0.1%'),
  },

  /* ---- Tabs Row (Image 1) ---- */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#EFF1F5',
    padding: wp('1%'),
    marginBottom: hp('1.8%'),
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.1%'),
    borderRadius: wp('3%'),
  },
  tabActive: {
    backgroundColor: '#FFF2EC',
  },
  tabText: {
    fontSize: RFValue(9.5),
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  /* ---- Member Card ---- */
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4.5%'),
    paddingVertical: hp('1.3%'),
    paddingLeft: wp('3.5%'),
    paddingRight: wp('3.5%'),
    marginBottom: hp('1.3%'),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  /* ---- Avatar ---- */
  avatarRing: {
    borderRadius: wp('8.5%'),
    backgroundColor: '#FFFFFF',
  },
  avatarRingNormal: {
    borderWidth: 0,
    padding: 0,
  },
  avatarCircle: {
    width: wp('12.8%'),
    height: wp('12.8%'),
    borderRadius: wp('6.4%'),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleNormal: {
    backgroundColor: '#FFF1EA',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: RFValue(12.5),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  avatarInitialsNormal: {
    color: '#C2410C',
  },

  /* ---- Name + badge + location ---- */
  memberBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: wp('3.5%'),
    marginRight: wp('2%'),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  memberName: {
    flexShrink: 1,
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.1,
  },
  tierBadge: {
    flexShrink: 0,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: wp('2.8%'),
    paddingVertical: hp('0.25%'),
    transform: [{ skewX: '-14deg' }],
  },
  tierBadgeText: {
    fontSize: RFValue(8.2),
    fontWeight: '700',
    letterSpacing: 0.2,
    transform: [{ skewX: '14deg' }],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.4%'),
    gap: wp('1%'),
  },
  memberAddress: {
    flex: 1,
    fontSize: RFValue(8.8),
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* ---- Chevron button ---- */
  chevronCircle: {
    width: wp('7.6%'),
    height: wp('7.6%'),
    borderRadius: wp('3.8%'),
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('1.5%'),
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },

  /* ---- Skeleton ---- */
  skeletonBlock: {
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#F3F4F6',
    borderRadius: wp('1.5%'),
  },
  skeletonTitle: {
    width: '55%',
    height: RFValue(9),
  },
  skeletonSub: {
    width: '80%',
    height: RFValue(7),
    marginTop: hp('0.7%'),
  },

  /* ---- Empty / Error ---- */
  emptyContainer: {
    alignItems: 'center',
    marginTop: hp('3%'),
    paddingVertical: hp('5%'),
    paddingHorizontal: wp('6%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#EFF1F5',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: '#FFF2EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.2%'),
  },
  emptyText: {
    fontSize: RFValue(11),
    color: Colors.dark,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: RFValue(9),
    color: Colors.gray,
    marginTop: hp('0.4%'),
    textAlign: 'center',
    lineHeight: RFValue(13.5),
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('3%'),
    marginTop: hp('1.8%'),
    gap: wp('1%'),
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: RFValue(10),
    fontWeight: '700',
  },
});

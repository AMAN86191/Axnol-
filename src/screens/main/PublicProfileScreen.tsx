import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LayoutGrid, AlignJustify, FileText, Heart, ShieldCheck } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import { Colors } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import useHomeStore from '../../zustand/useHomeStore';
import { RootStackParamList } from '../../navigation/types';
import { InstagramGrid } from '../../components/InstagramGrid';
import { FeedCard } from '../../components/FeedCard';
import { CommonHeader } from '../../components/CommonHeader';
import useAuthStore from '../../zustand/useAuthStore';
import { mapPostItem, PostItem, toAbsoluteUrl } from '../../utils/postMapper';

type PublicProfileScreenRouteProp = RouteProp<RootStackParamList, 'PublicProfileScreen'>;

// Short count: 999 → 999, 1200 → 1.2k, 12000 → 12k, 1500000 → 1.5m
const shortNumber = (scaled: number): string =>
  scaled < 10 ? scaled.toFixed(1).replace(/\.0$/, '') : String(Math.round(scaled));

const formatCount = (value: number): string => {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (n < 1000) return String(n);

  const k = n / 1000;
  // Round-up carry: 999999 ke 1000k nahi, 1m chahiye.
  if (k >= 999.5) return `${shortNumber(n / 1_000_000)}m`;

  return `${shortNumber(k)}k`;
};

const PublicProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<PublicProfileScreenRouteProp>();
  const { userId } = route.params;

  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');

  const [loading, setLoading] = useState(true);
  const [publicUser, setPublicUser] = useState<any>(null);
  const [publicPosts, setPublicPosts] = useState<any[]>([]);

  const getPublicProfileStore = useHomeStore(state => state.getPublicProfileStore);
  const { user: currentUser } = useAuthStore();

  const handleLike = useCallback((postId: string) => {
    setPublicPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const willBeLiked = !post.isLiked;
        let newLikedBy = [...(post.likedBy || [])];
        let newDislikedBy = [...(post.dislikedBy || [])];
        let newDislikes = post.dislikes;
        let newIsDisliked = post.isDisliked;

        if (willBeLiked) {
          if (currentUser?.id && !newLikedBy.some((u: any) => u.id === currentUser.id)) {
            newLikedBy.unshift({
              id: currentUser.id,
              name: currentUser.name || 'You',
              profile_pic: currentUser.profile_pic || currentUser.profile?.profile_pic,
              membership: currentUser.profile?.membership || currentUser.membership,
            });
          }
          if (post.isDisliked && currentUser?.id) {
            newDislikedBy = newDislikedBy.filter((u: any) => u.id !== currentUser.id);
            newDislikes = post.dislikes - 1;
            newIsDisliked = false;
          }
        } else {
          if (currentUser?.id) {
            newLikedBy = newLikedBy.filter((u: any) => u.id !== currentUser.id);
          }
        }

        return {
          ...post,
          isLiked: willBeLiked,
          likes: willBeLiked ? post.likes + 1 : post.likes - 1,
          likedBy: newLikedBy,
          isDisliked: newIsDisliked,
          dislikes: newDislikes,
          dislikedBy: newDislikedBy,
        };
      }
      return post;
    }));
  }, [currentUser]);

  const handleDislike = useCallback((postId: string) => {
    setPublicPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const willBeDisliked = !post.isDisliked;
        let newDislikedBy = [...(post.dislikedBy || [])];
        let newLikedBy = [...(post.likedBy || [])];
        let newLikes = post.likes;
        let newIsLiked = post.isLiked;

        if (willBeDisliked) {
          if (currentUser?.id && !newDislikedBy.some((u: any) => u.id === currentUser.id)) {
            newDislikedBy.unshift({
              id: currentUser.id,
              name: currentUser.name || 'You',
              profile_pic: currentUser.profile_pic || currentUser.profile?.profile_pic,
              membership: currentUser.profile?.membership || currentUser.membership,
            });
          }
          if (post.isLiked && currentUser?.id) {
            newLikedBy = newLikedBy.filter((u: any) => u.id !== currentUser.id);
            newLikes = post.likes - 1;
            newIsLiked = false;
          }
        } else {
          if (currentUser?.id) {
            newDislikedBy = newDislikedBy.filter((u: any) => u.id !== currentUser.id);
          }
        }

        return {
          ...post,
          isDisliked: willBeDisliked,
          dislikes: willBeDisliked ? post.dislikes + 1 : post.dislikes - 1,
          dislikedBy: newDislikedBy,
          isLiked: newIsLiked,
          likes: newLikes,
          likedBy: newLikedBy,
        };
      }
      return post;
    }));
  }, [currentUser]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPublicProfileStore(userId);
      console.log('Get public profile response', res);

      const responseData = res?.data || res;
      const userObj = responseData?.user || {};
      const profileObj = responseData?.profile || {};
      const statisticsObj = responseData?.statistics || {};
      const userPostsData = responseData?.posts?.data || responseData?.posts || [];

      // Map posts correctly using the shared mapper (normalizes likes/dislikes,
      // employee avatars and user ids the same way as the feed)
      const mappedPosts: PostItem[] = Array.isArray(userPostsData)
        ? userPostsData.map((item: any) =>
          mapPostItem(item, currentUser?.id, {
            unknown: userObj?.name || t('publicProfile.communityMember'),
            justNow: t('common.justNow'),
            fallbackAvatar: profileObj?.profile_pic || userObj?.profile_pic || userObj?.avatar,
          }),
        )
        : [];

      setPublicUser({ ...userObj, profile: profileObj, statistics: statisticsObj });
      setPublicPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, getPublicProfileStore, currentUser?.id, t]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePostPress = useCallback((postId: string) => {
    (navigation as any).navigate('PostDetailsScreen', { postId });
  }, [navigation]);

  // ---- Derived profile view-model -----------------------------------------
  const view = useMemo(() => {
    const avatar = toAbsoluteUrl(
      publicUser?.profile?.profile_pic ||
      publicUser?.profile_pic ||
      publicUser?.avatar ||
      publicUser?.profile?.avatar,
    );

    const name = publicUser?.name || t('publicProfile.communityMember');

    return {
      avatar,
      name,
      initials: name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'U',
      membership:
        publicUser?.profile?.membership || publicUser?.membership || '',
      bio: publicUser?.profile?.bio || publicUser?.bio || '',
      totalPosts: publicUser?.statistics?.posts_count || 0,
      totalLikes: publicUser?.statistics?.likes_count || 0,
    };
  }, [publicUser, t]);

  const userPosts = publicPosts;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <CommonHeader title={t('publicProfile.communityMember')} onBackPress={handleBack} />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <CommonHeader title={view.name} onBackPress={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ------------ Profile card ------------ */}
        <View style={styles.card}>
          <View style={styles.identityRow}>
            <View style={styles.avatarRing}>
              {view.avatar ? (
                <Image source={{ uri: view.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{view.initials}</Text>
                </View>
              )}
            </View>

            <View style={styles.identityBody}>
              <View style={styles.nameRow}>
                <Text style={styles.fullName} numberOfLines={2}>{view.name}</Text>
              </View>

              {view.membership ? (
                <View style={styles.membershipPill}>
                  <ShieldCheck size={RFValue(8)} color={Colors.dark} strokeWidth={2.6} />
                  <Text style={styles.membershipText} numberOfLines={1}>
                    {view.membership}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconWrapPeach}>
                <FileText size={RFValue(12)} color="#C2410C" strokeWidth={2.2} />
              </View>
              <View style={styles.statTextWrap}>
                <Text style={styles.statValueOrange} numberOfLines={1}>
                  {formatCount(view.totalPosts)}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {t('publicProfile.posts')}
                </Text>
              </View>
            </View>

            <View style={styles.statsDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconWrapGreen}>
                <Heart size={RFValue(12)} color="#059669" strokeWidth={2.2} />
              </View>
              <View style={styles.statTextWrap}>
                <Text style={[styles.statValueOrange, styles.statValueGreen]} numberOfLines={1}>
                  {formatCount(view.totalLikes)}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {t('publicProfile.likes')}
                </Text>
              </View>
            </View>
          </View>

        
        </View>

        {/* ------------ Grid / List tabs ------------ */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'grid' && styles.activeTabButton]}
            onPress={() => setActiveTab('grid')}
            activeOpacity={0.7}
          >
            <LayoutGrid
              size={RFValue(12)}
              color={activeTab === 'grid' ? Colors.primary : '#6B7280'}
              strokeWidth={2.2}
            />
            <Text style={[styles.tabButtonText, activeTab === 'grid' && styles.activeTabButtonText]}>
              {t('publicProfile.gridView')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'list' && styles.activeTabButton]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.7}
          >
            <AlignJustify
              size={RFValue(12)}
              color={activeTab === 'list' ? Colors.primary : '#6B7280'}
              strokeWidth={2.2}
            />
            <Text style={[styles.tabButtonText, activeTab === 'list' && styles.activeTabButtonText]}>
              {t('publicProfile.listView')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ------------ Content ------------ */}
        <View style={styles.contentWrap}>
          {userPosts.length === 0 ? (
            <View style={styles.emptyFeedContainer}>
              <View style={styles.emptyIconCircle}>
                <FileText size={RFValue(16)} color={Colors.primary} strokeWidth={1.9} />
              </View>
              <Text style={styles.emptyFeedText}>{t('publicProfile.noPostsYet')}</Text>
            </View>
          ) : activeTab === 'grid' ? (
            <View style={styles.gridWrapper}>
              <InstagramGrid posts={userPosts} onPostPress={handlePostPress} />
            </View>
          ) : (
            <View style={styles.listWrapper}>
              {userPosts.map(post => (
                <FeedCard
                  key={post.id}
                  postId={post.id}
                  author={post.author}
                  avatar={post.avatar}
                  meta={post.meta}
                  text={post.text}
                  image={post.image}
                  images={post.images}
                  likes={post.likes}
                  comments={post.comments}
                  isLiked={post.isLiked}
                  likedBy={post.likedBy}
                  dislikes={post.dislikes}
                  isDisliked={post.isDisliked}
                  dislikedBy={post.dislikedBy}
                  isOwnPost={false}
                  onLikePress={() => handleLike(post.id)}
                  onDislikePress={() => handleDislike(post.id)}
                  onPostPress={() => handlePostPress(post.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: hp('1.5%'),
    paddingBottom: hp('6%'),
  },

  /* ---- Profile card ---- */
  card: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    marginHorizontal: wp('3%'),
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7.5%'),
    borderWidth: 1,
    borderColor: '#FFE0D3',
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginRight: wp('4%'),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
  },
  avatarInitial: {
    fontSize: RFValue(13),
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: 1,
  },
  identityBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fullName: {
    flexShrink: 1,
    fontSize: RFValue(10.5),
    fontWeight: '700',
    color: Colors.dark,
    lineHeight: RFValue(15),
  },
  verifiedIcon: {
    marginLeft: wp('1.5%'),
    marginTop: hp('0.2%'),
  },

  /* ---- Membership pill ---- */
  membershipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    // marginTop: hp('0.7%'),
    borderRadius: wp('2%'),
    gap: wp('1%'),
  },
  membershipText: {
    flexShrink: 1,
    fontSize: RFValue(8.5),
    fontWeight: '700',
    color: Colors.dark,
  },

  /* ---- Stats row ---- */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    paddingTop: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#F3F4F6',
    marginHorizontal: wp('3%'),
  },
  statIconWrapPeach: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: '#FFF2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconWrapGreen: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextWrap: {
    flex: 1,
    marginLeft: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  statValueOrange: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#C2410C',
  },
  statValueGreen: {
    color: '#059669',
  },
  statLabel: {
    fontSize: RFValue(8.5),
    fontWeight: '600',
    color: '#4B5563',
    marginTop: hp('0.1%'),
  },



  /* ---- Tabs ---- */
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: wp('3%'),
    marginTop: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('1%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  activeTabButton: {
    backgroundColor: '#FFF5F0',
  },
  tabButtonText: {
    fontSize: RFValue(9),
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  /* ---- Content ---- */
  contentWrap: {
    marginTop: hp('1.5%'),
  },
  gridWrapper: {
    paddingHorizontal: wp('2%'),
  },
  listWrapper: {
    paddingHorizontal: wp('4%'),
  },
  emptyFeedContainer: {
    marginHorizontal: wp('3%'),
    paddingVertical: hp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyIconCircle: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.2%'),
  },
  emptyFeedText: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: wp('6%'),
    lineHeight: RFValue(14),
  },

  /* ---- Loading ---- */
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEBE0',
  },
  loadingText: {
    marginTop: hp('1.5%'),
    fontSize: RFValue(9.5),
    fontWeight: '600',
    color: Colors.gray,
  },
});

export default PublicProfileScreen;

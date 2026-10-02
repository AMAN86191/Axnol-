import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Check, Grid, AlignJustify, Award } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import { Colors } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import useHomeStore from '../../zustand/useHomeStore';
import { ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../../navigation/types';
import { InstagramGrid } from '../../components/InstagramGrid';
import { FeedCard } from '../../components/FeedCard';
import { CommonHeader } from '../../components/CommonHeader';
import useAuthStore from '../../zustand/useAuthStore';
import { mapPostItem, PostItem, toAbsoluteUrl } from '../../utils/postMapper';

type PublicProfileScreenRouteProp = RouteProp<RootStackParamList, 'PublicProfileScreen'>;

const PublicProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<PublicProfileScreenRouteProp>();
  const { userId } = route.params;
 console.log('userId :', userId);
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
              designation: currentUser.designation || currentUser.profile?.designation,
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
              designation: currentUser.designation || currentUser.profile?.designation,
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getPublicProfileStore(userId);
        console.log('Get public profile response', res)

        // Extracting data exactly as per API response
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

        // Combine user details for easy access
        setPublicUser({ ...userObj, profile: profileObj, statistics: statisticsObj });
        setPublicPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching public profile:', error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchProfile();
    }
  }, [userId, getPublicProfileStore, currentUser?.id, t]);

  // Compute total likes received across all posts
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePostPress = useCallback((postId: string) => {
    (navigation as any).navigate('PostDetailsScreen', { postId });
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <CommonHeader title={t('common.loading')} onBackPress={handleBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Extract avatar URL properly (handles relative + full employee_pics URLs)
  const avatarStr = toAbsoluteUrl(
    publicUser?.profile?.profile_pic ||
      publicUser?.profile_pic ||
      publicUser?.avatar ||
      publicUser?.profile?.avatar,
  );

  const formatDate = (d?: string) => {
    if (!d) return '';
    const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return String(d);
  };

  const location = [
    publicUser?.profile?.area,
    publicUser?.profile?.city,
    publicUser?.profile?.state,
    publicUser?.profile?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const infoRows = [
    {
      label: t('publicProfile.designation'),
      value: publicUser?.profile?.designation || publicUser?.designation,
    },
    { label: t('publicProfile.email'), value: publicUser?.email },
    { label: t('publicProfile.phone'), value: publicUser?.phone ? `+91 ${publicUser.phone}` : '' },
    {
      label: t('publicProfile.memberSince'),
      value: formatDate(publicUser?.profile?.join_date || publicUser?.join_date),
    },
    { label: t('publicProfile.location'), value: location },
    {
      label: t('publicProfile.profession'),
      value: publicUser?.profile?.profession || publicUser?.profession,
    },
    {
      label: t('publicProfile.dateOfBirth'),
      value: formatDate(publicUser?.profile?.dob || publicUser?.dob),
    },
    {
      label: t('publicProfile.dateOfMarriage'),
      value: formatDate(publicUser?.profile?.dom || publicUser?.dom),
    },
    {
      label: t('publicProfile.partnerName'),
      value: publicUser?.profile?.partner_name,
    },
  ].filter(row => row.value);

  console.log('publicUser', publicUser)
  // Safe fallbacks to map dynamic API fields to component expectations
  const user = {
    name: publicUser?.name || t('publicProfile.communityMember'),
    avatar: avatarStr,
    bio: publicUser?.profile?.bio || publicUser?.bio || '',
    badge: publicUser?.membership ? t('common.member') : '',
    hasMembership: publicUser?.profile?.designation ,
    memberId: publicUser?.uid || publicUser?.member_id || '',
    designation: publicUser?.profile?.designation || '',
    totalPosts: publicUser?.statistics?.posts_count || 0,
    totalLikes: publicUser?.statistics?.likes_count || 0,
  };

  const userPosts = publicPosts;
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <CommonHeader title={user.name} onBackPress={handleBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Instagram style Info row (Avatar + Stats) */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
                  <Text style={{ fontSize: RFValue(22), fontWeight: '700', color: Colors.dark }}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{user.totalPosts}</Text>
              <Text style={styles.statLabel}>{t('publicProfile.posts')}</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{user.totalLikes}</Text>
              <Text style={styles.statLabel}>{t('publicProfile.likes')}</Text>
            </View>
          </View>
        </View>

        {/* Bio Details Section */}
        <View style={styles.bioContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{user.name}</Text>
            <View style={styles.verifiedBadge}>
              <Check size={RFValue(7.5)} color="#FFF" strokeWidth={4} />
            </View>
          </View>

          {/* Membership Badge Pill
          {(user.hasMembership || user.designation) && (
            <View style={styles.badgeRow}>
              {user.hasMembership && (
                <View style={styles.badgePill}>
                  <Award size={RFValue(9)} color="#D97706" strokeWidth={2} />
                  <Text style={styles.badgeText}>{user.badge}</Text>
                </View>
              )}
              {user.designation && (
                <View style={[styles.badgePill, styles.designationPill]}>
                  <Text style={styles.designationText}>{user.designation}</Text>
                </View>
              )}
            </View>
          )} */}

          {/* Member ID */}
          {user.memberId && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('publicProfile.memberId')} </Text>
              <Text style={styles.metaValue}>{user.memberId}</Text>
            </View>
          )}

          {/* Bio text */}
          {user.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}

          {/* Profile details */}
          {/* {infoRows.length > 0 && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoSectionTitle}>{t('publicProfile.about')}</Text>
              {infoRows.map(row => (
                <View key={row.label} style={styles.infoRow}>
                  <Text style={styles.infoRowLabel}>{row.label}</Text>
                  <Text style={styles.infoRowValue} numberOfLines={2}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )} */}
        </View>

        {/* Tab Selection Bar (Grid vs List) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'grid' && styles.activeTabItem]}
            onPress={() => setActiveTab('grid')}
            activeOpacity={0.7}
          >
            <Grid
              size={RFValue(16)}
              color={activeTab === 'grid' ? Colors.primary : '#888'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'list' && styles.activeTabItem]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.7}
          >
            <AlignJustify
              size={RFValue(16)}
              color={activeTab === 'list' ? Colors.primary : '#888'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Tab Content rendering */}
        <View style={styles.tabContentContainer}>
          {activeTab === 'grid' ? (
            userPosts.length > 0 ? (
              <View style={styles.gridWrapper}>
                <InstagramGrid posts={userPosts} onPostPress={handlePostPress} />
              </View>
            ) : (
              <View style={styles.emptyFeedContainer}>
                <Text style={styles.emptyFeedText}>{t('publicProfile.noPostsYet')}</Text>
              </View>
            )
          ) : (
            userPosts.length > 0 ? (
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
            ) : (
              <View style={styles.emptyFeedContainer}>
                <Text style={styles.emptyFeedText}>{t('publicProfile.noPostsYet')}</Text>
              </View>
            )
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
    paddingBottom: hp('5%'),
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('1.5%'),
    backgroundColor: Colors.white,
  },
  avatarContainer: {
    marginRight: wp('6%'),
  },
  avatarRing: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('10%'),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('10%'),
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: wp('2%'),
  },
  statColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: RFValue(16),
    fontWeight: '800',
    color: Colors.dark,
  },
  statLabel: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    fontWeight: '500',
    marginTop: hp('0.3%'),
  },
  bioContainer: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
    backgroundColor: Colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.4%'),
  },
  fullName: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
    marginRight: wp('1.5%'),
  },
  verifiedBadge: {
    width: wp('3.5%'),
    height: wp('3.5%'),
    borderRadius: wp('1.75%'),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: hp('0.3%'),
    marginBottom: hp('0.8%'),
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
    borderWidth: 0.8,
    borderColor: '#FFEBE0',
    borderRadius: wp('1.5%'),
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('2.2%'),
    marginRight: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  badgeText: {
    fontSize: RFValue(9),
    color: '#D97706',
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  designationPill: {
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0',
  },
  designationText: {
    fontSize: RFValue(9),
    color: '#137333',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  metaLabel: {
    fontSize: RFValue(8.5),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  metaValue: {
    fontSize: RFValue(8.5),
    fontWeight: '700',
    color: '#4B5563',
  },
  bioText: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    lineHeight: RFValue(14.5),
    fontWeight: '400',
    marginTop: hp('0.3%'),
  },
  infoContainer: {
    marginTop: hp('1.2%'),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: hp('1%'),
  },
  infoSectionTitle: {
    fontSize: RFValue(9),
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: hp('0.6%'),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('0.6%'),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  infoRowLabel: {
    fontSize: RFValue(9.5),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  infoRowValue: {
    fontSize: RFValue(9.5),
    fontWeight: '700',
    color: '#4B5563',
    flex: 1,
    textAlign: 'right',
    marginLeft: wp('4%'),
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    height: hp('6%'),
    backgroundColor: Colors.white,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabContentContainer: {
    marginTop: hp('1%'),
  },
  gridWrapper: {
    paddingHorizontal: wp('2%'),
  },
  listWrapper: {
    paddingHorizontal: wp('4%'),
  },
  emptyFeedContainer: {
    paddingVertical: hp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    marginHorizontal: wp('4%'),
  },
  emptyFeedText: {
    fontSize: RFValue(11.5),
    color: Colors.gray,
    textAlign: 'center',
  },
});

export default PublicProfileScreen;

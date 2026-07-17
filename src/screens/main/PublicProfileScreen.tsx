import React, { useState, useMemo, useCallback } from 'react';
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
import useHomeStore from '../../zustand/useHomeStore';
import { ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../../navigation/types';
import { InstagramGrid } from '../../components/InstagramGrid';
import { FeedCard } from '../../components/FeedCard';
import { CommonHeader } from '../../components/CommonHeader';

type PublicProfileScreenRouteProp = RouteProp<RootStackParamList, 'PublicProfileScreen'>;

const PublicProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PublicProfileScreenRouteProp>();
  const { userId } = route.params;

  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');

  const [loading, setLoading] = useState(true);
  const [publicUser, setPublicUser] = useState<any>(null);
  const [publicPosts, setPublicPosts] = useState<any[]>([]);

  const getPublicProfileStore = useHomeStore(state => state.getPublicProfileStore);

  React.useEffect(() => {
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
        const userPostsData = responseData?.posts || [];

        // Map posts correctly based on the new API format
        const mappedPosts = Array.isArray(userPostsData) ? userPostsData.map((item: any) => {
          let additionalImages: string[] = [];

          if (item.images && Array.isArray(item.images)) {
            additionalImages = item.images.map((img: any) => typeof img.image === 'string' ? img.image : '');
          }

          let displayImage = additionalImages.length > 0 ? additionalImages[0] : null;

          let authorAvatar = 'https://randomuser.me/api/portraits/lego/1.jpg';
          if (profileObj.profile_pic) {
            authorAvatar = typeof profileObj.profile_pic === 'string' ? profileObj.profile_pic : authorAvatar;
          }

          return {
            id: item.id?.toString() || Math.random().toString(),
            author: userObj.name || 'Unknown',
            avatar: authorAvatar,
            meta: item.created_at || 'Just now',
            text: item.description || '',
            image: displayImage,
            images: additionalImages,
            likes: item.likes || 0,
            comments: item.comments_count || 0,
            isLiked: item.is_liked || false,
            userId: userObj.id,
          };
        }) : [];

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
  }, [userId, getPublicProfileStore]);

  // Compute total likes received across all posts
  const totalLikes = useMemo(() => {
    return publicPosts.reduce((acc, curr) => acc + (curr.likes || curr.likes_count || 0), 0);
  }, [publicPosts]);

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
        <CommonHeader title="Loading..." onBackPress={handleBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Extract avatar URL properly to avoid ReadableNativeMap error
  let avatarStr = '';
  if (publicUser?.profile?.profile_pic && typeof publicUser.profile.profile_pic === 'string') {
    avatarStr = publicUser.profile.profile_pic.startsWith('http') ? publicUser.profile.profile_pic : `https://gst.tambimotors.com/${publicUser.profile.profile_pic}`;
  }

  // Safe fallbacks to map dynamic API fields to component expectations
  const user = {
    name: publicUser?.name || 'Community Member',
    avatar: avatarStr,
    bio: publicUser?.profile?.bio || '',
    badge: publicUser?.membership ? 'Member' : '',
    hasMembership: !!publicUser?.membership,
    memberId: publicUser?.uid || '',
    designation: publicUser?.profile?.designation || '',
    totalPosts: publicUser?.statistics?.posts_count || 0,
    totalLikes: publicUser?.statistics?.likes_count || 0,
  };

  const userPosts = publicPosts;
console.log('userPosts', userPosts)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <CommonHeader title={user.name} onBackPress={handleBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Instagram style Info row (Avatar + Stats) */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{user.totalPosts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{user.totalLikes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
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

          {/* Membership Badge Pill */}
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
          )}

          {/* Member ID */}
          {user.memberId && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>ID: </Text>
              <Text style={styles.metaValue}>{user.memberId}</Text>
            </View>
          )}

          {/* Bio text */}
          <Text style={styles.bioText}>{user.bio}</Text>
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
                <Text style={styles.emptyFeedText}>No posts shared yet by this member.</Text>
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
                    isOwnPost={false}

                    onPostPress={() => handlePostPress(post.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyFeedContainer}>
                <Text style={styles.emptyFeedText}>No posts shared yet by this member.</Text>
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
    width: wp('20%'),
    height: wp('20%'),
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
    fontSize: RFValue(13.5),
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

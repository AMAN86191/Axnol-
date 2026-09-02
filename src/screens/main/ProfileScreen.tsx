import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import { PrimaryHeader } from '../../components/PrimaryHeader';
import useHomeStore from '../../zustand/useHomeStore';

// Extracted Sub-components with their own encapsulated styles
import { ProfileHeader } from '../../components/ProfileHeader';
import { ProfileStats } from '../../components/ProfileStats';
import { ActiveCampaignCard } from '../../components/ActiveCampaignCard';
import { MembershipBenefits } from '../../components/MembershipBenefits';
import { QuoteCard } from '../../components/QuoteCard';
import { ProfileTabs } from '../../components/ProfileTabs';
import { ContributionsTab } from '../../components/ContributionsTab';
import { MembershipIdCardModal } from '../../components/MembershipIdCardModal';
import { InstagramGrid } from '../../components/InstagramGrid';
import useAuthStore from '../../zustand/useAuthStore';
import { Colors } from '../../theme/colors';
import { useTranslation } from 'react-i18next';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'posts' | 'contributions'>('posts');

  // Profile data states
  const [isIdCardModalVisible, setIsIdCardModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const { user, updateProfile, getProfile } = useAuthStore();
  const { getmypost, getContributionsStore } = useHomeStore();

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    try {
      const response = await getmypost();
console.log('mypost response', response)
      if (response && response.posts && response.posts.data) {
        const mappedPosts = response.posts.data.map((item: any) => {
          let imageUrl = item.post_img ? `https://gst.tambimotors.com/${item.post_img}` : null;
          let additionalImages: string[] = [];
          
          if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            additionalImages = item.images.map((img: any) => img.image);
          } else if (item.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
            additionalImages = item.post_images.map((img: any) => `https://gst.tambimotors.com/${img.post_img}`);
          }
          
          if (additionalImages.length === 0 && imageUrl) {
            additionalImages = [imageUrl];
          }
          let displayImage = imageUrl || (additionalImages.length > 0 ? additionalImages[0] : null);

          let avatarUrl = '';
          if (item.author?.profile_pic) {
            avatarUrl = item.author.profile_pic;
          } else if (item.user?.avatar) {
            avatarUrl = item.user.avatar.startsWith('http') ? item.user.avatar : `https://gst.tambimotors.com/${item.user.avatar}`;
          }

          const isLikedByCurrentUser = Array.isArray(item.liked_by) && user?.id 
              ? item.liked_by.some((likedUser: any) => likedUser.id === user.id)
              : item.is_liked || false;

          return {
            id: item.id?.toString(),
            author: item.author_name || item.author?.name || item.user?.name || item.admin?.name || t('common.unknown'),
            avatar: avatarUrl,
            meta: item.created_at || t('common.justNow'),
            text: item.description || '',
            image: displayImage,
            images: additionalImages,
            likes: item.likes_count ?? item.likes ?? 0,
            comments: item.comments_count || 0,
            isLiked: isLikedByCurrentUser,
            likedBy: item.liked_by || [],
            userId: item.user_id?.toString() || item.admin_id?.toString(),
            status: item.status,
          };
        });
        setMyPosts(mappedPosts);
      }
    } catch (error) {
      console.log('Error fetching my posts:', error);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, [getmypost]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchMyPosts();
      }
    }, [fetchMyPosts, user?.id])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyPosts();
  }, [fetchMyPosts]);
  // Wrap callbacks in useCallback to prevent recreating them on every render
  const handleCameraPress = useCallback(() => {
    (navigation as any).navigate('EditProfileScreen');
  }, [navigation]);

  const handleEmailPress = useCallback(() => {
    // Navigate or handle email press
  }, []);

  const handlePhonePress = useCallback(() => {
    // Dialer interaction logic inside ProfileHeader/Linkings
  }, []);

  const handleDonatePress = useCallback(() => {
    (navigation as any).navigate('Donate');
  }, [navigation]);

  const handlePostPress = useCallback((postId: string) => {
    (navigation as any).navigate('PostDetailsScreen', { postId: postId });
  }, [navigation]);

  const handleCertificatePress = useCallback(() => {
    (navigation as any).navigate('MembershipCertificateScreen', { profileData });
  }, [navigation, profileData]);


  const [contributionsData, setContributionsData] = useState<any[]>([]);

  const fetchContributions = useCallback(async () => {
    try {
      const response = await getContributionsStore();
      console.log('Contributions API Response:', response);
      if (response && response.donations) {
        const mappedData = response.donations.map((d: any) => ({
          id: d.id?.toString() || Math.random().toString(),
          title: d.plan?.plan_name || t('profile.donation'),
          category: d.plan?.duration 
            ? d.plan.duration.charAt(0).toUpperCase() + d.plan.duration.slice(1) 
            : t('profile.general'),
          amount: `₹${parseFloat(d.amount || 0).toLocaleString('en-IN')}`,
          date: d.date || t('common.na'),
          status: d.payment_status?.toLowerCase() === 'paid' ? t('common.completed') : t('common.pending'),
          txnId: d.transaction_id || t('common.na'),
        }));
        setContributionsData(mappedData);
      }
    } catch (error) {
      console.log('Error fetching contributions:', error);
    }
  }, [getContributionsStore]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      console.log('User Profile API Response:', response);
      if (response?.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  }, [getProfile]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchContributions();
        fetchProfile();
      }
    }, [fetchContributions, fetchProfile, user?.id])
  );

  const hasMembership = !!(profileData?.user?.membership || user?.membership);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <PrimaryHeader />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Profile Details Header Component */}
        <ProfileHeader
          profileName={profileData?.user?.name || user?.name || t('profile.loading')}
          profileEmail={profileData?.user?.email || user?.email || t('common.na')}
          profilePhone={profileData?.user?.phone || user?.phone ? `+91 ${profileData?.user?.phone || user?.phone}` : t('common.na')}
          uid={profileData?.user?.uid || user?.uid}
          joinDate={profileData?.profile?.join_date || user?.profile?.join_date}
          designation={profileData?.profile?.designation || user?.profile?.designation}
          bio={profileData?.profile?.bio || user?.profile?.bio}
          avatarUri={
            profileData?.profile?.profile_pic 
              ? `${profileData.profile.profile_pic}` 
              : (user?.profile?.profile_pic ? `${user.profile.profile_pic}` : undefined)
          }
          onCameraPress={handleCameraPress}
          onEmailPress={handleEmailPress}
          onPhonePress={handlePhonePress}
          membership={profileData?.user?.membership || user?.membership}
          dob={profileData?.profile?.dob || user?.profile?.dob}
          dom={profileData?.profile?.dom || user?.profile?.dom}  
          profession={profileData?.profile?.profession || user?.profile?.profession}
          referralCode={profileData?.profile?.referral_code || user?.profile?.referral_code}
          country={profileData?.profile?.country || user?.profile?.country}
        />

        {/* Profile Statistics Component */}
        <ProfileStats 
          postsCount={profileData?.statistics?.posts_count || myPosts.length} 
          referralsCount={profileData?.statistics?.referrals_count || profileData?.statistics?.no_of_refer || 0}
          likesCount={profileData?.statistics?.likes_count || 0}
        />

        {/* Active Campaign Card Component */}
        <ActiveCampaignCard onDonatePress={handleDonatePress} />

        {/* Membership Section Component */}
        {hasMembership && (
          <MembershipBenefits
            isMember={hasMembership}
            onCertificatePress={handleCertificatePress}
            onIdCardPress={() => setIsIdCardModalVisible(true)}
            onBecomeMemberPress={() => (navigation as any).navigate('Membership')}
          />
        )}

        {/* Quote Section Component */}
        <QuoteCard />

        {/* Custom Segmented Tabs Component */}
        <ProfileTabs activeTab={activeTab} onTabPress={setActiveTab} />

        {/* Tab Content rendering */}
        {activeTab === 'posts' && (
          <View style={styles.myPostsFeedList}>
            {loadingPosts ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : myPosts.length > 0 ? (
              <InstagramGrid posts={myPosts} onPostPress={handlePostPress} />
            ) : (
              <View style={styles.emptyFeedContainer}>
                <Text style={styles.emptyFeedText}>{t('profile.noPostsYet')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'contributions' && (
          <View style={styles.myPostsFeedList}>
            {contributionsData.length > 0 ? (
              <ContributionsTab contributions={contributionsData} />
            ) : (
              <View style={styles.emptyFeedContainer}>
                <Text style={styles.emptyFeedText}>{t('profile.noContributionsYet')}</Text>
                <TouchableOpacity 
                  style={{ 
                    marginTop: hp('2%'), 
                    paddingVertical: hp('1.2%'), 
                    paddingHorizontal: wp('6%'), 
                    backgroundColor: Colors.primary, 
                    borderRadius: wp('5%') 
                  }}
                  onPress={handleDonatePress}
                >
                  <Text style={{ color: '#FFF', fontSize: RFValue(11), fontWeight: '700' }}>{t('drawer.donateNow')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Membership ID Card Modal Component */}
      <MembershipIdCardModal
        visible={isIdCardModalVisible}
        onClose={() => setIsIdCardModalVisible(false)}
        profileName={profileData?.user?.name || user?.name || t('common.unknown')}
        avatarUri={
          profileData?.profile?.profile_pic 
            ? `${profileData.profile.profile_pic}` 
            : (user?.profile?.profile_pic ? `${user.profile.profile_pic}` : undefined)
        }
        memberId={profileData?.user?.uid || user?.uid || t('common.na')}
        designation={(profileData?.user?.membership || user?.membership) ? t('profile.memberDesignation') : t('common.na')}
        since={profileData?.user?.start_date || user?.start_date 
          ? new Date(profileData?.user?.start_date || user?.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) 
          : t('common.na')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    paddingBottom: hp('15%'),
  },
  myPostsFeedList: {
    paddingHorizontal: wp('4%'),
    marginTop: hp('1.5%'),
  },
  emptyFeedContainer: {
    paddingVertical: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: wp('4%'),
  },
  emptyFeedText: {
    fontSize: RFValue(11),
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ProfileScreen;

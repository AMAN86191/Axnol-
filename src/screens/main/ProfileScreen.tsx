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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import { PrimaryHeader } from '../../components/PrimaryHeader';
import { EditProfileModal } from '../../components/EditProfileModal';
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
import { WelcomeNewUserCard } from '../../components/WelcomeNewUserCard';
import useAuthStore from '../../zustand/useAuthStore';
import { Colors } from '../../theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'posts' | 'contributions'>('posts');
  const [isMember, setIsMember] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Profile data states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isIdCardModalVisible, setIsIdCardModalVisible] = useState(false);
  const { user } = useAuthStore();
  const { getmypost } = useHomeStore();

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    try {
      const response = await getmypost();
      if (response && response.posts && response.posts.data) {
        const mappedPosts = response.posts.data.map((item: any) => {
          let imageUrl = item.post_img ? `https://gst.tambimotors.com/${item.post_img}` : null;
          let additionalImages: string[] = [];
          if (item.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
            additionalImages = item.post_images.map((img: any) => `https://gst.tambimotors.com/${img.post_img}`);
          }
          if (additionalImages.length === 0 && imageUrl) {
            additionalImages = [imageUrl];
          }
          let displayImage = imageUrl || (additionalImages.length > 0 ? additionalImages[0] : null);

          return {
            id: item.id?.toString(),
            author: item.user?.name || item.admin?.name || 'Unknown',
            avatar: item.user?.avatar ? `https://gst.tambimotors.com/${item.user.avatar}` : 'https://randomuser.me/api/portraits/lego/1.jpg',
            meta: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now',
            text: item.description || '',
            image: displayImage,
            images: additionalImages,
            likes: item.likes || 0,
            comments: item.comments_count || 0,
            isLiked: item.is_liked || false,
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
    setIsEditModalVisible(true);
  }, []);

  const handleEmailPress = useCallback(() => {
    setIsEditModalVisible(false);
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
    (navigation as any).navigate('MembershipCertificateScreen');
  }, [navigation]);

  const handleDemoTogglePress = useCallback(() => {
    setIsMember(prev => !prev);
  }, []);


  const contributionsData = useMemo(() => [
    {
      id: 'c1',
      title: 'Daily Grass Seva',
      category: 'Feed Support',
      amount: '₹1,100',
      date: '08 Jun 2026',
      status: 'Completed',
      txnId: 'TXN83940174',
    },
    {
      id: 'c2',
      title: 'Emergency Medical Kit',
      category: 'Medical Care',
      amount: '₹2,500',
      date: '28 May 2026',
      status: 'Completed',
      txnId: 'TXN83910543',
    },
    {
      id: 'c3',
      title: 'Calf Shelter Sponsorship',
      category: 'Shelter Build',
      amount: '₹10,000',
      date: '15 May 2026',
      status: 'Completed',
      txnId: 'TXN83890212',
    },
    {
      id: 'c4',
      title: 'Monthly Gaushala Care',
      category: 'Recurring Feed',
      amount: '₹500',
      date: '01 May 2026',
      status: 'Active',
      txnId: 'TXN83764923',
    },
  ], []);

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
          profileName={user?.name || 'Loading...'}
          profileEmail={user?.email || 'N/A'}
          profilePhone={user?.phone ? `+91 ${user.phone}` : 'N/A'}
          uid={user?.uid}
          joinDate={user?.profile?.join_date}
          designation={user?.profile?.designation}
          bio={user?.profile?.bio}
          avatarUri={user?.profile?.profile_pic ? `https://gst.tambimotors.com/${user.profile.profile_pic}` : undefined}
          onCameraPress={handleCameraPress}
          onEmailPress={handleEmailPress}
          onPhonePress={handlePhonePress}
        />

        {/* Profile Statistics Component */}
        {isNewUser ? (
          <WelcomeNewUserCard onDonatePress={handleDonatePress} />
        ) : (
          <ProfileStats postsCount={myPosts.length} />
        )}

        {/* Active Campaign Card Component */}
        <ActiveCampaignCard onDonatePress={handleDonatePress} />

        {/* Membership Section Component */}
        <MembershipBenefits
          isMember={isMember}
          onCertificatePress={handleCertificatePress}
          onIdCardPress={() => setIsIdCardModalVisible(true)}
          onBecomeMemberPress={() => (navigation as any).navigate('Membership')}
          onDemoTogglePress={handleDemoTogglePress}
        />

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
                <Text style={styles.emptyFeedText}>You haven't posted anything yet. Tap the '+' tab to create one!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'contributions' && (
          <ContributionsTab contributions={contributionsData} />
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      {/* <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        currentName={profileName}
        currentEmail={profileEmail}
        currentPhone={profilePhone}
        onUpdate={(newName, newEmail, newPhone) => {
          setProfileName(newName);
          setProfileEmail(newEmail);
          setProfilePhone(newPhone);
        }}
      /> */}

      {/* Membership ID Card Modal Component */}
      <MembershipIdCardModal
        visible={isIdCardModalVisible}
        onClose={() => setIsIdCardModalVisible(false)}
        profileName={user?.name || 'Loading...'}
        
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

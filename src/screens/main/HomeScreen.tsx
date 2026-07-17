import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { FeedCard } from '../../components/FeedCard';
import { QuickActions } from '../../components/QuickActions';
import { BannerSlider } from '../../components/BannerSlider';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { UpcomingEventsSection } from '../../components/UpcomingEventsSection';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { getPosts, getEvents } = useHomeStore();
  const [homePosts, setHomePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, getProfile } = useAuthStore();


  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getProfile().catch((err: any) => console.log('Error refreshing profile in Home:', err));
      }
    }, [token, getProfile])
  );

  const fetchHomeFeed = async () => {
      try {
        const response = await getPosts(1);
        getEvents().catch(e => console.log('Error fetching events:', e));
        console.log('Home screen feed get posts data ', response)
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
              userId: item.user_id || item.admin_id,
            };
          });
          setHomePosts(mappedPosts.slice(0, 5)); // show max 5 on home screen
        }
      } catch (error) {
        console.log('Error fetching home feed:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchHomeFeed();
  }, [getPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomeFeed();
    if (token) {
      await getProfile().catch((err: any) => console.log('Error refreshing profile:', err));
    }
    setRefreshing(false);
  }, [token, getPosts]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <PrimaryHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Banner Card Slider / Carousel */}
        <BannerSlider />

        {/* Quick Actions Component */}
        <QuickActions />

        {/* Upcoming Events Section */}
        {/* <UpcomingEventsSection /> */}

        {/* Feed Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Feed</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FeedScreen' as never)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={RFValue(12)} color={Colors.primary} style={{ marginLeft: wp('1%'), marginTop: hp('0.2%') }} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Feed List */}
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : homePosts.length > 0 ? (
          homePosts.map((item) => (
            <FeedCard
              key={item.id}
              postId={item.id}
              author={item.author}
              avatar={item.avatar}
              meta={item.meta}
              text={item.text}
              image={item.image}
              images={item.images}
              likes={item.likes}
              comments={item.comments}
              isLiked={item.isLiked}
              isOwnPost={false}
              onPostPress={() => (navigation as any).navigate('PostDetailsScreen', { postId: item.id })}
              onProfilePress={() => {
                if (item.userId === 'current_user') {
                  (navigation as any).navigate('Profile');
                } else {
                  (navigation as any).navigate('PublicProfileScreen', { userId: item.userId });
                }
              }}
            />
          ))
        ) : (
          <View style={styles.emptyFeedContainer}>
            <Text style={styles.emptyFeedText}>No posts yet. Be the first to share something!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('7%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: Colors.dark,
  },
  viewAllText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyFeedContainer: {
    paddingVertical: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeedText: {
    fontSize: RFValue(11),
    color: Colors.gray,
    textAlign: 'center',
  },
});

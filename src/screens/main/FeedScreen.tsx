import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, ScrollView, Image, ActivityIndicator, View, TouchableOpacity, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface PostItem {
  id: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image?: string | null;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  likedBy?: any[];
  userId?: string;
  status?: string;
}


const FeedScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { getPosts, loading, toggleLikePost } = useHomeStore();
  const { user } = useAuthStore();
  const [feedData, setFeedData] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchFeed = async (pageNumber: number) => {
    if (pageNumber > 1) {
      setLoadingMore(true);
    }
    try {
      const response = await getPosts(pageNumber);
      console.log('Get post api response', response);
      
      const postsData = response?.posts?.data;
      if (postsData && Array.isArray(postsData)) {
        // Map API response to match PostItem
        const mappedPosts = postsData.map((item: any) => {
          let imageUrl = item.post_img ? `https://gst.tambimotors.com/${item.post_img}` : null;
          
          let additionalImages: string[] = [];
          if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            additionalImages = item.images.map((img: any) => img.image);
          } else if (item.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
             additionalImages = item.post_images.map((img: any) => `https://gst.tambimotors.com/${img.post_img}`);
          }
          
          // If post_images is empty, fallback to the single post_img
          if (additionalImages.length === 0 && imageUrl) {
             additionalImages = [imageUrl];
          }

          // Use imageUrl or the first image from the array
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

          const isDislikedByCurrentUser = Array.isArray(item.disliked_by) && user?.id 
              ? item.disliked_by.some((dislikedUser: any) => dislikedUser.id === user.id)
              : item.is_disliked || false;

          return {
            id: item.id?.toString() || Math.random().toString(),
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
            dislikes: item.dislikes_count ?? item.dislikes ?? 0,
            isDisliked: isDislikedByCurrentUser,
            dislikedBy: item.disliked_by || [],
            userId: item.user_id?.toString() || item.admin_id?.toString(),
            status: item.status,
          };
        });

        if (pageNumber === 1) {
          setFeedData(mappedPosts);
        } else {
          setFeedData(prev => [...prev, ...mappedPosts]);
        }

        if (response.posts.current_page >= response.posts.last_page) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else if (pageNumber === 1) {
        setFeedData([]);
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error fetching feed:', error);
    } finally {
      if (pageNumber === 1) setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const toggleLike = async (postId: string) => {
    setFeedData(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const willBeLiked = !post.isLiked;
          let newLikedBy = [...(post.likedBy || [])];
          
          if (willBeLiked) {
            if (user?.id && !newLikedBy.some(u => u.id === user.id)) {
              newLikedBy.unshift({
                id: user.id,
                name: user.name || t('common.you'),
                profile_pic: user.profile_pic || user.profile?.profile_pic,
                designation: user.designation || user.profile?.designation,
              });
            }
          } else {
            if (user?.id) {
              newLikedBy = newLikedBy.filter(u => u.id !== user.id);
            }
          }

          return {
            ...post,
            isLiked: willBeLiked,
            likes: willBeLiked ? post.likes + 1 : post.likes - 1,
            likedBy: newLikedBy,
          };
        }
        return post;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader title={t('home.communityFeed')} />

      {initialLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item, index) => item.id + index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item: post }) => (
            <FeedCard
              postId={post.id}
              author={post.author}
              avatar={post.avatar}
              meta={post.meta}
              text={post.text}
              images={(post as any).images}
              likes={post.likes}
              comments={post.comments}
              isLiked={post.isLiked}
              likedBy={post.likedBy}
              dislikes={post.dislikes}
              isDisliked={post.isDisliked}
              dislikedBy={post.dislikedBy}
              onLikePress={() => toggleLike(post.id)}
              onPostPress={() => (navigation as any).navigate('PostDetailsScreen', { postId: post.id })}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : hasMore ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>{t('feed.loadMore')}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('12%'), // Space for custom bottom tab
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp('2%'),
    marginHorizontal: wp('2%'),
  },
  loadMoreText: {
    color: '#FFF',
    fontSize: RFValue(12),
    fontWeight: 'bold',
  },
});

export default FeedScreen;

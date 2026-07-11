import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, ScrollView, Image, ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';
import useHomeStore from '../../zustand/useHomeStore';
import { RFValue } from 'react-native-responsive-fontsize';

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
}


const FeedScreen = () => {
  const navigation = useNavigation();
  const { getPosts, loading, toggleLikePost } = useHomeStore();
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
          if (item.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
             additionalImages = item.post_images.map((img: any) => `https://gst.tambimotors.com/${img.post_img}`);
          }
          
          // If post_images is empty, fallback to the single post_img
          if (additionalImages.length === 0 && imageUrl) {
             additionalImages = [imageUrl];
          }

          // Use imageUrl or the first image from the array
          let displayImage = imageUrl || (additionalImages.length > 0 ? additionalImages[0] : null);

          return {
            id: item.id?.toString() || Math.random().toString(),
            author: item.user?.name || item.admin?.name || 'Unknown',
            avatar: item.user?.avatar ? `https://gst.tambimotors.com/${item.user.avatar}` : 'https://randomuser.me/api/portraits/lego/1.jpg',
            meta: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now',
            text: item.description || '',
            image: displayImage,
            images: additionalImages,
            likes: item.likes || 0,
            comments: item.comments_count || 0,
            isLiked: item.is_liked || false,
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
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader title="Community Feed" />

      {initialLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {feedData.map(post => (
            <FeedCard
              key={post.id}
              postId={post.id}
              author={post.author}
              avatar={post.avatar}
              meta={post.meta}
              text={post.text}
          
              images={(post as any).images}
              likes={post.likes}
              comments={post.comments}
              isLiked={post.isLiked}
              onLikePress={() => toggleLike(post.id)}
              onPostPress={() => (navigation as any).navigate('PostDetailsScreen', { postId: post.id })}
             
            />
          ))}

          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}

        </ScrollView>
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

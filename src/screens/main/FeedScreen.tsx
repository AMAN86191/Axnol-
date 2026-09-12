import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, StatusBar, ActivityIndicator, View, TouchableOpacity, Text, FlatList } from 'react-native';
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

import { mapPostItem, PostItem } from '../../utils/postMapper';


const FeedScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { getPosts } = useHomeStore();
  const { user } = useAuthStore();
  const [feedData, setFeedData] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchFeed = useCallback(async (pageNumber: number) => {
    if (pageNumber > 1) {
      setLoadingMore(true);
    }
    try {
      const response = await getPosts(pageNumber);
      console.log('Get post api response', response);
      
      const postsData = response?.posts?.data;
      if (postsData && Array.isArray(postsData)) {
        const mappedPosts = postsData.map((item: any) =>
          mapPostItem(item, user?.id, {
            unknown: t('common.unknown'),
            justNow: t('common.justNow'),
          })
        );

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
  }, [getPosts, user, t]);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const toggleLike = (postId: string) => {
    setFeedData(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        const willBeLiked = !post.isLiked;

        if (!willBeLiked) {
          const newLikedBy = (post.likedBy || []).filter(u => u.id !== user?.id);
          return {
            ...post,
            isLiked: false,
            likes: Math.max((post.likes || 0) - 1, 0),
            likedBy: newLikedBy,
          };
        }

        let newLikedBy = [...(post.likedBy || [])];
        if (user?.id && !newLikedBy.some(u => u.id === user.id)) {
          newLikedBy.unshift({
            id: user.id,
            name: user.name || t('common.you'),
            profile_pic: user.profile_pic || user.profile?.profile_pic,
            designation: user.designation || user.profile?.designation,
          });
        }

        return {
          ...post,
          isLiked: true,
          likes: (post.likes || 0) + 1,
          likedBy: newLikedBy,
          isDisliked: post.isDisliked ? false : post.isDisliked,
          dislikes: post.isDisliked ? Math.max((post.dislikes || 0) - 1, 0) : post.dislikes,
          dislikedBy: post.isDisliked ? (post.dislikedBy || []).filter(u => u.id !== user?.id) : post.dislikedBy,
        };
      })
    );
  };

  const toggleDislike = (postId: string) => {
    setFeedData(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        const willBeDisliked = !post.isDisliked;

        if (!willBeDisliked) {
          const newDislikedBy = (post.dislikedBy || []).filter(u => u.id !== user?.id);
          return {
            ...post,
            isDisliked: false,
            dislikes: Math.max((post.dislikes || 0) - 1, 0),
            dislikedBy: newDislikedBy,
          };
        }

        let newDislikedBy = [...(post.dislikedBy || [])];
        if (user?.id && !newDislikedBy.some(u => u.id === user.id)) {
          newDislikedBy.unshift({
            id: user.id,
            name: user.name || t('common.you'),
            profile_pic: user.profile_pic || user.profile?.profile_pic,
            designation: user.designation || user.profile?.designation,
          });
        }

        return {
          ...post,
          isDisliked: true,
          dislikes: (post.dislikes || 0) + 1,
          dislikedBy: newDislikedBy,
          isLiked: post.isLiked ? false : post.isLiked,
          likes: post.isLiked ? Math.max((post.likes || 0) - 1, 0) : post.likes,
          likedBy: post.isLiked ? (post.likedBy || []).filter(u => u.id !== user?.id) : post.likedBy,
        };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader title={t('home.communityFeed')} onBackPress={()=>navigation.goBack()} />

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
              onDislikePress={() => toggleDislike(post.id)}
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

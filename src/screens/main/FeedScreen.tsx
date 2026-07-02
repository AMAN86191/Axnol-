import React, { useState } from 'react';
import { StyleSheet, StatusBar, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';

interface PostItem {
  id: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
}

const INITIAL_FEED_DATA = [
  {
    id: '1',
    author: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    meta: '2 hours ago • Verified Sevak',
    text: "The new calf 'Nandi' is doing wonderfully! Thanks to the donor community for the specialized medical kit.",
    image: Image.resolveAssetSource(require('../../../assets/images/feed/cow_calf_1781177033799.png')).uri,
    images: [
      Image.resolveAssetSource(require('../../../assets/images/feed/cow_calf_1781177033799.png')).uri,
      Image.resolveAssetSource(require('../../../assets/images/feed/cow_medical_1781177084941.png')).uri,
      Image.resolveAssetSource(require('../../../assets/images/feed/cow_portrait_1781177072664.png')).uri
    ],
    likes: 124,
    comments: 18,
    isLiked: true,
  },
  {
    id: '2',
    author: 'Ananda Das',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    meta: '5 hours ago • Patron Member',
    text: "Visiting the main shed today. Clean environment and healthy diets for all the cows.",
    image: Image.resolveAssetSource(require('../../../assets/images/feed/cow_feeding_1781177046811.png')).uri,
    images: [
      Image.resolveAssetSource(require('../../../assets/images/feed/cow_feeding_1781177046811.png')).uri,
      Image.resolveAssetSource(require('../../../assets/images/feed/cow_shelter_1781177059865.png')).uri
    ],
    likes: 98,
    comments: 12,
    isLiked: false,
  },
  {
    id: '3',
    author: 'Priya Patel',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    meta: '1 day ago • Volunteer Coordinator',
    text: 'Green grass distribution drive was completed successfully today.',
    image: Image.resolveAssetSource(require('../../../assets/images/feed/cow_shelter_1781177059865.png')).uri,
    likes: 230,
    comments: 45,
    isLiked: false,
  },
  {
    id: '4',
    author: 'Vikram Singh',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    meta: '2 days ago • Donor',
    text: 'Happy to contribute towards fodder and medical care.',
    image: Image.resolveAssetSource(require('../../../assets/images/feed/cow_medical_1781177084941.png')).uri,
    likes: 87,
    comments: 9,
    isLiked: true,
  },
];

const FeedScreen = () => {
  const navigation = useNavigation();
  const [feedData, setFeedData] = useState<PostItem[]>(INITIAL_FEED_DATA);

  const toggleLike = (postId: string) => {
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {feedData.map(post => (
          <FeedCard
            key={post.id}
            author={post.author}
            avatar={post.avatar}
            meta={post.meta}
            text={post.text}
            image={post.image}
            images={(post as any).images}
            likes={post.likes}
            comments={post.comments}
            isLiked={post.isLiked}
            onLikePress={() => toggleLike(post.id)}
            onPostPress={() => (navigation as any).navigate('PostDetailsScreen', { postId: post.id })}
            onProfilePress={() => {
              const authorMapping: Record<string, string> = {
                'Rahul Sharma': 'user_rahul',
                'Ananda Das': 'current_user',
                'Priya Patel': 'user_priya',
                'Vikram Singh': 'user_vikram',
              };
              const mappedUserId = authorMapping[post.author] || 'user_rahul';
              if (mappedUserId === 'current_user') {
                (navigation as any).navigate('Profile');
              } else {
                (navigation as any).navigate('PublicProfileScreen', { userId: mappedUserId });
              }
            }}
          />
        ))}
      </ScrollView>
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
});

export default FeedScreen;

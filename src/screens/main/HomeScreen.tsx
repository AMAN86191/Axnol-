import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { FeedCard } from '../../components/FeedCard';
import { QuickActions } from '../../components/QuickActions';
import { BannerSlider } from '../../components/BannerSlider';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { usePosts } from '../../context/PostContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { posts, toggleLikePost } = usePosts();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <PrimaryHeader  />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card Slider / Carousel */}
        <BannerSlider />

        {/* Quick Actions Component */}
        <QuickActions />

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
        {posts.length > 0 ? (
          posts.map((item) => (
            <FeedCard
              key={item.id}
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
              onLikePress={() => toggleLikePost(item.id)}
              // onPostPress={() => (navigation as any).navigate('PostDetailsScreen', { postId: item.id })}
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

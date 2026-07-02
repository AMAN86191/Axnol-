import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';
import { usePosts } from '../../context/PostContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Comment } from '../../components/CommentsModal';
import { RFValue } from 'react-native-responsive-fontsize';

type PostDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailsScreen'>;

const getUserIdFromAuthor = (authorName: string): string => {
  if (authorName === 'Rahul Sharma') return 'user_rahul';
  if (authorName === 'Priya Patel') return 'user_priya';
  if (authorName === 'Vikram Singh') return 'user_vikram';
  return 'current_user';
};

const PostDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postId } = route.params;

  const { posts, toggleLikePost, deletePost } = usePosts();

  // Find the post in context
  const post = posts.find(p => p.id === postId);

  // Local state for inline comments
  const [commentsList, setCommentsList] = useState<Comment[]>([
    {
      id: '1',
      author: 'Rahul Sharma',
      text: 'Beautiful cows! Jai Sri Ram. 🙏',
      time: '2h ago',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '2',
      author: 'Priya Patel',
      text: 'Great work by the Gaumata Trust team. Keep it up!',
      time: '1h ago',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const commentInputRef = useRef<TextInput>(null);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLike = useCallback(() => {
    if (post) {
      toggleLikePost(post.id);
    }
  }, [post, toggleLikePost]);

  const handleEdit = useCallback(() => {
    if (post) {
      (navigation as any).navigate('EditPostScreen', { postId: post.id });
    }
  }, [post, navigation]);

  const handleDelete = useCallback(() => {
    if (!post) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePost(post.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [post, deletePost, navigation]);

  // When clicking on FeedCard's comment icon, focus the text input at the bottom of details screen
  const handleCommentIconPress = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  const handleAddComment = useCallback(() => {
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: String(commentsList.length + 1),
      author: 'Ananda Das', // Mock current user
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      text: newCommentText.trim(),
      time: 'Just now',
    };

    setCommentsList(prev => [...prev, newComment]);
    setNewCommentText('');
  }, [newCommentText, commentsList.length]);

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CommonHeader title="Post Details" onBackPress={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found or has been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Post Details" onBackPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp('10%') : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* FeedCard rendering with comment icon override */}
          <FeedCard
            author={post.author}
            avatar={post.avatar}
            meta={post.meta}
            text={post.text}
            image={post.image}
            images={post.images}
            likes={post.likes}
            comments={commentsList.length}
            isLiked={post.isLiked}
            isOwnPost={post.userId === 'current_user'}
            onLikePress={handleLike}
            onEditPress={handleEdit}
            onDeletePress={handleDelete}
            onCommentPress={handleCommentIconPress}
            onProfilePress={() => {
              if (post.userId === 'current_user') {
                (navigation as any).navigate('Profile');
              } else {
                (navigation as any).navigate('PublicProfileScreen', { userId: post.userId });
              }
            }}
          />

          {/* Comments Section Title */}
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>Comments ({commentsList.length})</Text>
          </View>

          {/* Comments List rendering */}
          <View style={styles.commentsContainer}>
            {commentsList.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <TouchableOpacity
                  onPress={() => {
                    const cUserId = getUserIdFromAuthor(comment.author);
                    if (cUserId === 'current_user') {
                      (navigation as any).navigate('Profile');
                    } else {
                      (navigation as any).navigate('PublicProfileScreen', { userId: cUserId });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <TouchableOpacity
                    onPress={() => {
                      const cUserId = getUserIdFromAuthor(comment.author);
                      if (cUserId === 'current_user') {
                        (navigation as any).navigate('Profile');
                      } else {
                        (navigation as any).navigate('PublicProfileScreen', { userId: cUserId });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.commentAuthorText}>
                      {comment.author}{' '}
                      <Text style={styles.commentMetaText}>{comment.time}</Text>
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.commentBodyText}>{comment.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment Input Bar at the bottom of the screen */}
        {/* <View style={styles.inputBar}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150' }}
            style={styles.inputUserAvatar}
          />
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor={Colors.gray}
            value={newCommentText}
            onChangeText={setNewCommentText}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newCommentText.trim()}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.postButtonText,
                newCommentText.trim() && styles.postButtonTextActive,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View> */}
      </KeyboardAvoidingView>
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
    paddingVertical: hp('1%'),
    paddingBottom: hp('4%'),
  },
  commentsSectionHeader: {
    paddingHorizontal: wp('3%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    // marginTop: hp('1%'),
  },
  commentsTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  commentsContainer: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    marginRight: wp('3%'),
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorText: {
    fontSize: RFValue(10.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  commentMetaText: {
    fontWeight: '400',
    fontSize: RFValue(8.5),
    color: Colors.gray,
    marginLeft: wp('2%'),
  },
  commentBodyText: {
    fontSize: RFValue(10.5),
    color: '#444444',
    marginTop: hp('0.3%'),
    lineHeight: RFValue(14),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  inputUserAvatar: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    marginRight: wp('3%'),
  },
  commentInput: {
    flex: 1,
    fontSize: RFValue(11),
    color: Colors.dark,
    paddingVertical: hp('0.5%'),
    maxHeight: hp('8%'),
  },
  postButtonText: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: '#CCC',
    marginLeft: wp('3%'),
  },
  postButtonTextActive: {
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PostDetailsScreen;

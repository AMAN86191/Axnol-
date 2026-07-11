import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Trash2 } from 'lucide-react-native';

import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';
import { usePosts } from '../../context/PostContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Comment } from '../../components/CommentsModal';
import { RFValue } from 'react-native-responsive-fontsize';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';

type PostDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailsScreen'>;


const PostDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postId } = route.params;
  const { getPostDetails, getComments, commentPost, deleteComment, deletePostStore } = useHomeStore();
  const { user } = useAuthStore();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPost = async () => {
        try {
          const response = await getPostDetails(postId);
          console.log('Post details api response', response);
          const item = response?.post || response?.data || response;
          if (item) {
            let imageUrl = item.post_img ? `https://gst.tambimotors.com/${item.post_img}` : null;
            let additionalImages: string[] = [];
            if (item.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
              additionalImages = item.post_images.map((img: any) => `https://gst.tambimotors.com/${img.post_img}`);
            }
            if (additionalImages.length === 0 && imageUrl) {
              additionalImages = [imageUrl];
            }
            let displayImage = imageUrl || (additionalImages.length > 0 ? additionalImages[0] : null);

            setPost({
              id: item.id?.toString() || postId,
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
            });
          }
        } catch (error) {
          console.log('Error fetching post details:', error);
        } finally {
          setLoading(false);
        }
      };

      const loadComments = async () => {
        try {
          const res = await getComments(postId);
          console.log('post comment api response ', res)
          const commentsArray = res?.comments?.data || res?.comments || res?.data || [];
          if (commentsArray && Array.isArray(commentsArray)) {
            const mappedComments = commentsArray.map((c: any) => ({
              id: c.id?.toString() || Math.random().toString(),
              author: c.user?.name || c.admin?.name || 'Unknown',
              avatar: c.user?.avatar ? `https://gst.tambimotors.com/${c.user.avatar}` : 'https://randomuser.me/api/portraits/lego/1.jpg',
              text: c.comment || '',
              time: new Date(c.created_at).toLocaleDateString(),
              userId: c.user_id?.toString() || c.admin_id?.toString(),
            }));
            setCommentsList(mappedComments);
          }
        } catch (error) {
          console.log('Error loading comments:', error);
        }
      };

      fetchPost();
      loadComments();
    }, [postId, getPostDetails, getComments])
  );

  // Local state for inline comments
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const commentInputRef = useRef<TextInput>(null);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLike = useCallback(async () => {
    if (post) {
      setPost((prev: any) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    }
  }, [post]);

  const handleEdit = useCallback(() => {
    if (post) {
      (navigation as any).navigate('EditPostScreen', { post: post });
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
          onPress: async () => {
            try {
              await deletePostStore(post.id);
              Alert.alert('Success', 'Post deleted successfully.');
              navigation.goBack();
            } catch (error) {
              console.log('Failed to delete post:', error);
              Alert.alert('Error', 'Failed to delete the post from the server.');
            }
          },
        },
      ]
    );
  }, [post, deletePostStore, navigation]);

  // When clicking on FeedCard's comment icon, focus the text input at the bottom of details screen
  const handleCommentIconPress = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!newCommentText.trim()) return;

    const tempId = Math.random().toString();
    const commentText = newCommentText.trim();
    const newComment: Comment = {
      id: tempId,
      author: user?.name || 'You',
      avatar: user?.avatar ? `https://gst.tambimotors.com/${user.avatar}` : 'https://randomuser.me/api/portraits/lego/1.jpg',
      text: commentText,
      time: 'Just now',
      userId: user?.id?.toString(),
    };

    setCommentsList(prev => [...prev, newComment]);
    setPost((prev: any) => ({ ...prev, comments: prev.comments + 1 }));
    setNewCommentText('');

    try {
      const res = await commentPost(postId, commentText);
      console.log('Comment post response (inline):', res);
    } catch (error) {
      console.log('Error posting comment:', error);
      setCommentsList(prev => prev.filter(c => c.id !== tempId));
      setPost((prev: any) => ({ ...prev, comments: prev.comments - 1 }));
      Alert.alert('Error', 'Failed to post comment.');
    }
  }, [newCommentText, postId, commentPost, user]);

  const handleDeleteComment = useCallback((commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setCommentsList(prev => prev.filter(c => c.id !== commentId));
          setPost((prev: any) => ({ ...prev, comments: prev.comments - 1 }));

          try {
            await deleteComment(commentId);
            console.log('Inline comment deleted successfully');
          } catch (error) {
            console.log('Failed to delete inline comment:', error);
            Alert.alert('Error', 'Failed to delete comment from server.');
          }
        }
      }
    ]);
  }, [deleteComment]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CommonHeader title="Post Details" onBackPress={handleBack} />
        <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
  console.log('post', post)
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
            onLikePress={handleLike}
            onEditPress={handleEdit}
            onDeletePress={handleDelete}
            onCommentPress={handleCommentIconPress}
            isOwnPost={post.userId === user?.id?.toString()}
            status={post.status}
          />

          {/* Comments Section Title */}
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>Comments ({post.comments})</Text>
          </View>

          {/* Comments List rendering */}
          <View style={styles.commentsContainer}>
            {commentsList.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>

                <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />

                <View style={styles.commentContent}>

                  <Text style={styles.commentAuthorText}>
                    {comment.author}{' '}
                    <Text style={styles.commentMetaText}>{comment.time}</Text>
                  </Text>

                  <Text style={styles.commentBodyText}>{comment.text}</Text>
                </View>

                {user?.id?.toString() === comment.userId && (
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id)} style={{ padding: 5, marginLeft: wp('2%') }}>
                    <Trash2 size={16} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment Input Bar at the bottom of the screen */}
        <View style={styles.inputBar}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
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
                newCommentText.trim() ? styles.postButtonTextActive : {},
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
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

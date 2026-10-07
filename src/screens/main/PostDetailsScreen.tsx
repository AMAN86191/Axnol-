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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Trash2 } from 'lucide-react-native';

import { CommonHeader } from '../../components/CommonHeader';
import { FeedCard } from '../../components/FeedCard';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Comment } from '../../components/CommentsModal';
import { RFValue } from 'react-native-responsive-fontsize';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';
import { useTranslation } from 'react-i18next';
import { mapPostItem } from '../../utils/postMapper';

type PostDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailsScreen'>;


const PostDetailsScreen = () => {
  const { t } = useTranslation();
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
            setPost(mapPostItem(item, user?.id, {
              unknown: t('common.unknown'),
              justNow: t('common.justNow'),
            }));
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
            const mappedComments = commentsArray.map((c: any) => {
              let avatarUrl = '';
              if (c.user?.profile_pic) {
                avatarUrl = c.user.profile_pic;
              } else if (c.user?.avatar) {
                avatarUrl = c.user.avatar.startsWith('http') ? c.user.avatar : `https://gst.tambimotors.com/${c.user.avatar}`;
              } else if (c.admin?.avatar) {
                avatarUrl = c.admin.avatar.startsWith('http') ? c.admin.avatar : `https://gst.tambimotors.com/${c.admin.avatar}`;
              }

              return {
                id: c.id?.toString() || Math.random().toString(),
                author: c.user?.name || c.admin?.name || t('common.unknown'),
                avatar: avatarUrl,
                text: c.comment || '',
                time: c.created_at || t('common.justNow'),
                userId: c.user_id?.toString() || c.admin_id?.toString(),
              };
            });
            setCommentsList(mappedComments);
          }
        } catch (error) {
          console.log('Error loading comments:', error);
        }
      };

      fetchPost();
      loadComments();
    }, [postId, getPostDetails, getComments, user, t])
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
      setPost((prev: any) => {
        const willBeLiked = !prev.isLiked;
        let newLikedBy = [...(prev.likedBy || [])];
        let newDislikedBy = [...(prev.dislikedBy || [])];
        let newDislikes = prev.dislikes;
        let newIsDisliked = prev.isDisliked;
        
        if (willBeLiked) {
          if (user?.id && !newLikedBy.some(u => u.id === user.id)) {
            newLikedBy.unshift({
              id: user.id,
              name: user.name || t('common.you'),
              profile_pic: user.profile_pic || user.profile?.profile_pic,
              membership: user.profile?.membership || user.membership,
            });
          }
          if (prev.isDisliked && user?.id) {
            newDislikedBy = newDislikedBy.filter(u => u.id !== user.id);
            newDislikes = Math.max(prev.dislikes - 1, 0);
            newIsDisliked = false;
          }
        } else {
          if (user?.id) {
            newLikedBy = newLikedBy.filter(u => u.id !== user.id);
          }
        }

        return {
          ...prev,
          isLiked: willBeLiked,
          likes: Math.max(willBeLiked ? prev.likes + 1 : prev.likes - 1, 0),
          likedBy: newLikedBy,
          isDisliked: newIsDisliked,
          dislikes: newDislikes,
          dislikedBy: newDislikedBy,
        };
      });
    }
  }, [post, user, t]);

  const handleDislike = useCallback(async () => {
    if (post) {
      setPost((prev: any) => {
        const willBeDisliked = !prev.isDisliked;
        let newDislikedBy = [...(prev.dislikedBy || [])];
        let newLikedBy = [...(prev.likedBy || [])];
        let newLikes = prev.likes;
        let newIsLiked = prev.isLiked;
        
        if (willBeDisliked) {
          if (user?.id && !newDislikedBy.some(u => u.id === user.id)) {
            newDislikedBy.unshift({
              id: user.id,
              name: user.name || t('common.you'),
              profile_pic: user.profile_pic || user.profile?.profile_pic,
              membership: user.profile?.membership || user.membership,
            });
          }
          if (prev.isLiked && user?.id) {
            newLikedBy = newLikedBy.filter(u => u.id !== user.id);
            newLikes = Math.max(prev.likes - 1, 0);
            newIsLiked = false;
          }
        } else {
          if (user?.id) {
            newDislikedBy = newDislikedBy.filter(u => u.id !== user.id);
          }
        }

        return {
          ...prev,
          isDisliked: willBeDisliked,
          dislikes: Math.max(willBeDisliked ? prev.dislikes + 1 : prev.dislikes - 1, 0),
          dislikedBy: newDislikedBy,
          isLiked: newIsLiked,
          likes: newLikes,
          likedBy: newLikedBy,
        };
      });
    }
  }, [post, user, t]);

  const handleEdit = useCallback(() => {
    if (post) {
      (navigation as any).navigate('EditPostScreen', { post: post });
    }
  }, [post, navigation]);

  const handleDelete = useCallback(() => {
    if (!post) return;

    Alert.alert(
      t('postDetails.deletePost'),
      t('postDetails.deletePostConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostStore(post.id);
              Alert.alert(t('common.success'), t('postDetails.postDeleted'));
              navigation.goBack();
            } catch (error) {
              console.log('Failed to delete post:', error);
              Alert.alert(t('common.error'), t('postDetails.deleteFailed'));
            }
          },
        },
      ]
    );
  }, [post, deletePostStore, navigation, t]);

  // When clicking on FeedCard's comment icon, focus the text input at the bottom of details screen
  const handleCommentIconPress = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!newCommentText.trim()) return;

    const tempId = Math.random().toString();
    const commentText = newCommentText.trim();
    let currentUserAvatar = '';
    if (user?.profile?.profile_pic) {
      currentUserAvatar = user.profile.profile_pic;
    } else if (user?.avatar) {
      currentUserAvatar = user.avatar.startsWith('http') ? user.avatar : `https://gst.tambimotors.com/${user.avatar}`;
    }

    const newComment: Comment = {
      id: tempId,
      author: user?.name || t('common.you'),
      avatar: currentUserAvatar,
      text: commentText,
      time: t('common.justNow'),
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
      Alert.alert(t('common.error'), t('postDetails.commentFailed'));
    }
  }, [newCommentText, postId, commentPost, user, t]);

  const handleDeleteComment = useCallback((commentId: string) => {
    Alert.alert(t('postDetails.deleteComment'), t('postDetails.deleteCommentConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setCommentsList(prev => prev.filter(c => c.id !== commentId));
          setPost((prev: any) => ({ ...prev, comments: prev.comments - 1 }));

          try {
            await deleteComment(commentId);
            console.log('Inline comment deleted successfully');
          } catch (error) {
            console.log('Failed to delete inline comment:', error);
            Alert.alert(t('common.error'), t('postDetails.commentDeleteFailed'));
          }
        }
      }
    ]);
  }, [deleteComment, t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CommonHeader title={t('postDetails.title')} onBackPress={handleBack} />
        <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CommonHeader title={t('postDetails.title')} onBackPress={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('postDetails.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  console.log('post', post)
  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title={t('postDetails.title')} onBackPress={handleBack} />

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
            likedBy={post.likedBy}
            dislikes={post.dislikes}
            isDisliked={post.isDisliked}
            dislikedBy={post.dislikedBy}
            onLikePress={handleLike}
            onDislikePress={handleDislike}
            onEditPress={handleEdit}
            onDeletePress={handleDelete}
            onCommentPress={handleCommentIconPress}
            isOwnPost={post.userId === user?.id?.toString()}
            status={post.status}
          />

          {/* Comments Section Title */}
          {/* <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>{t('postDetails.comments', { count: post.comments })}</Text>
          </View> */}

          {/* Comments List rendering */}
          {/* <View style={styles.commentsContainer}>
            {commentsList.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>

                {comment.avatar ? (
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '700', color: Colors.dark }}>
                      {(comment.author || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

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
          </View> */}
        </ScrollView>

        {/* Comment Input Bar at the bottom of the screen
        <View style={styles.inputBar}>
          {(() => {
            let currentUserAvatar = '';
            if (user?.profile?.profile_pic) {
              currentUserAvatar = user.profile.profile_pic;
            } else if (user?.avatar) {
              currentUserAvatar = user.avatar.startsWith('http') ? user.avatar : `https://gst.tambimotors.com/${user.avatar}`;
            }
            return currentUserAvatar ? (
              <Image source={{ uri: currentUserAvatar }} style={styles.inputUserAvatar} />
            ) : (
              <View style={[styles.inputUserAvatar, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
                <Text style={{ fontSize: RFValue(11), fontWeight: '700', color: Colors.dark }}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            );
          })()}
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder={t('postDetails.writeComment')}
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
              {t('common.post')}
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

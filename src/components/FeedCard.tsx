import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Heart, MessageSquare, Share2, Pencil, Trash2 } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';
import { CommentsModal, Comment } from './CommentsModal';
import useHomeStore from '../zustand/useHomeStore';
import useAuthStore from '../zustand/useAuthStore';
import { useEffect } from 'react';

interface FeedCardProps {
  postId?: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
  status?: string;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onProfilePress?: () => void;
  onPostPress?: () => void;
}

export const FeedCard = ({
  postId,
  author,
  avatar,
  meta,
  text,
  image,
  images,
  likes,
  comments,
  isLiked,
  isOwnPost,
  status,
  onLikePress,
  onCommentPress,
  onSharePress,
  onEditPress,
  onDeletePress,
  onProfilePress,
  onPostPress,
}: FeedCardProps) => {
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - wp('8%'));
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  useEffect(() => {
    setCommentsCount(comments);
    setLocalLikes(likes);
    setLocalIsLiked(isLiked);
  }, [comments, likes, isLiked]);

  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const { getComments, commentPost, toggleLikePost, deleteComment } = useHomeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isCommentsVisible && postId) {
      loadComments();
    }
  }, [isCommentsVisible, postId]);

  const loadComments = async () => {
    if (!postId) return;
    try {
      const res = await getComments(postId);
      console.log('Get comments response:', res);
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
        setLocalComments(mappedComments);
      }
    } catch (error) {
      console.log('Error loading comments:', error);
    }
  };

  const handleLikeButtonPress = async () => {
    if (onLikePress) {
      onLikePress();
    }
    
    if (!postId) return;

    setLocalIsLiked(prev => !prev);
    setLocalLikes(prev => localIsLiked ? prev - 1 : prev + 1);

    try {
      const res = await toggleLikePost(postId);
      console.log('FeedCard local like response:', res);
    } catch (error) {
      console.log('Error toggling like:', error);
      setLocalIsLiked(prev => !prev);
      setLocalLikes(prev => localIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    if (onSharePress) {
      onSharePress();
      return;
    }
    try {
      await Share.share({
        message: `Check out this post from ${author} on Gaushala Community:\n\n"${text}"`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCommentButtonPress = () => {
    if (onCommentPress) {
      onCommentPress();
    }
    setIsCommentsVisible(true);
  };

  const handleAddComment = async (commentText: string) => {
    const tempId = Math.random().toString();
    const newComment: Comment = {
      id: tempId,
      author: user?.name || 'You',
      avatar: user?.avatar ? `https://gst.tambimotors.com/${user.avatar}` : 'https://randomuser.me/api/portraits/lego/1.jpg',
      text: commentText,
      time: 'Just now',
      userId: user?.id?.toString(),
    };

    setLocalComments(prev => [...prev, newComment]);
    setCommentsCount(prev => prev + 1);

    if (postId) {
      try {
        const res = await commentPost(postId, commentText);
        console.log('Comment post response:', res);
        // Optionally reload comments to get the real ID and time
        loadComments();
      } catch (error) {
        console.log('Error posting comment:', error);
        // Rollback optimistic update
        setLocalComments(prev => prev.filter(c => c.id !== tempId));
        setCommentsCount(prev => prev - 1);
        Alert.alert('Error', 'Failed to post comment.');
      }
    }
  };

  return (
    <View 
      style={styles.feedCard}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0) {
          setCardWidth(width - wp('4%')); // Subtract horizontal padding (wp('2%') * 2)
        }
      }}
    >
      {/* Card Header */}
      <View style={styles.feedHeader}>
        <TouchableOpacity
          style={styles.feedHeaderLeft}
          onPress={onProfilePress}
          disabled={!onProfilePress}
          activeOpacity={0.7}
        >
          <Image source={{ uri: avatar }} style={styles.feedAvatar} />
          <View style={styles.textContainer}>
            <Text style={styles.feedAuthor}>{author}</Text>
            <Text style={styles.feedMeta}>{meta}</Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && (
          <View style={styles.feedHeaderActions}>
            {status && (
              <View style={[styles.statusBadge, { backgroundColor: status === 'active' ? '#E6F4EA' : '#FEE2E2' }]}>
                <Text style={[styles.statusBadgeText, { color: status === 'active' ? '#137333' : '#B91C1C' }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={onEditPress} style={styles.headerActionBtn} activeOpacity={0.7}>
              <Pencil size={RFValue(11)} color={Colors.primary} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDeletePress} style={[styles.headerActionBtn, styles.deleteBtn]} activeOpacity={0.7}>
              <Trash2 size={RFValue(11)} color="#EF4444" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}
      </View>

        {/* Card Image or Carousel */}
        {images && images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            snapToInterval={cardWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
          >
            {images.map((imgUri, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.carouselImageWrapper, { width: cardWidth }]}
                activeOpacity={0.95} 
                onPress={onPostPress} 
                disabled={!onPostPress}
              >
                <Image source={{ uri: imgUri }} style={[styles.feedImage, styles.carouselImage]} resizeMode="cover" />
                {images.length > 1 && (
                  <View style={styles.carouselBadge}>
                    <Text style={styles.carouselBadgeText}>{idx + 1} / {images.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          image && (
            <TouchableOpacity activeOpacity={0.95} onPress={onPostPress} disabled={!onPostPress}>
              <Image
                source={{ uri: image }}
                style={styles.feedImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )
        )}

        {/* Card Description */}
        <TouchableOpacity activeOpacity={0.95} onPress={onPostPress} disabled={!onPostPress}>
          <Text style={styles.feedText}>{text}</Text>
        </TouchableOpacity>

      {/* Card Actions */}
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.feedActionItem} onPress={handleLikeButtonPress} activeOpacity={0.7}>
          <Heart
            size={RFValue(14)}
            color={localIsLiked ? Colors.primary : Colors.gray}
            fill={localIsLiked ? Colors.primary : 'none'}
            strokeWidth={1.5}
          />
          <Text style={[styles.feedActionText, localIsLiked && styles.activeActionText]}>
            {localLikes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedActionItem} onPress={handleCommentButtonPress} activeOpacity={0.7}>
          <MessageSquare size={RFValue(14)} color={Colors.gray} strokeWidth={1.5} />
          <Text style={styles.feedActionText}>{commentsCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedActionItem} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={RFValue(14)} color={Colors.gray} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Reusable Comments Bottom Sheet Modal */}
      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        comments={localComments}
        onAddComment={handleAddComment}
        currentUserId={user?.id?.toString()}
        onDeleteComment={(commentId) => {
          Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: async () => {
                // Remove optimistically
                setLocalComments(prev => prev.filter(c => c.id !== commentId));
                setCommentsCount(prev => prev - 1);
                
                try {
                const res =   await deleteComment(commentId);
                console.log('Comment delete api res ', res)
                  console.log('Comment deleted successfully');
                } catch (error) {
                  console.log('Failed to delete comment from server', error);
                  Alert.alert('Error', 'Failed to delete comment from server.');
                }
              }
            }
          ]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  feedCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    // borderWidth: 1,
    // borderColor: Colors.border,
    padding: wp('2%'),
    marginBottom: hp('2%'),
    width: '100%',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.2%'),
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feedHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1.5%'),
    marginRight: wp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusBadgeText: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
  },
  headerActionBtn: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('2%'),
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  feedAvatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginRight: wp('3%'),
  },
  textContainer: {
    flex: 1,
  },
  feedAuthor: {
    fontSize: RFValue(12.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  feedMeta: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    marginTop: hp('0.1%'),
  },
  feedText: {
    fontSize: RFValue(11.5),
    color: '#333333',
    lineHeight: RFValue(16),
    marginBottom: hp('1.5%'),
  },
  feedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    paddingTop: hp('1.2%'),
  },
  feedActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('6%'),
  },
  feedActionText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
    color: Colors.gray,
    marginLeft: wp('1.5%'),
  },
  activeActionText: {
    color: Colors.primary,
  },
  carouselContainer: {
    width: '100%',
    marginBottom: hp('1.5%'),
  },
  carouselImageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: wp('3%'),
  },
  carouselImage: {
    marginBottom: 0,
  },
  carouselBadge: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('3%'),
  },
  carouselBadgeText: {
    color: '#FFF',
    fontSize: RFValue(8.2),
    fontWeight: '700',
  },
});

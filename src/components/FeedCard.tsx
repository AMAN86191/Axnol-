import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { ChevronDown, Share2, Pencil, Trash2, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';
import { CommentsModal, Comment } from './CommentsModal';
import { LikesModal } from './LikesModal';
import { DislikesModal } from './DislikesModal';
import useHomeStore from '../zustand/useHomeStore';
import useAuthStore from '../zustand/useAuthStore';

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
  likedBy?: any[];
  dislikes?: number;
  isDisliked?: boolean;
  dislikedBy?: any[];
  isOwnPost?: boolean;
  status?: string;
  onLikePress?: () => void;
  onDislikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onProfilePress?: () => void;
  onPostPress?: () => void;
}

const EMPTY_ARRAY: any[] = [];

// Instagram clamps feed images between 4:5 (max portrait) and 1.91:1 (max landscape).
// Anything outside that range gets `cover`-cropped instead of letterboxed with empty space.
const MIN_FEED_RATIO = 4 / 5;
const MAX_FEED_RATIO = 1.91;

const clampFeedRatio = (ratio: number): number => {
  if (!ratio || !isFinite(ratio) || ratio <= 0) return 1;
  return Math.min(Math.max(ratio, MIN_FEED_RATIO), MAX_FEED_RATIO);
};

// Description isse zyada lines ka hua to "Read more" dikhta hai
const COLLAPSED_LINES = 2;
// onTextLayout FlatList/ScrollView ke andar unreliable hota hai — virtualized
// items par fire nahi hota ya provisional width se measure hota hai. Isliye
// character count ek reliable fallback hai (~2 lines is font size/card width par).
const COLLAPSED_CHARS = 120;

// Instagram-style short count: 999 → 999, 1800 → 1.8K, 150000 → 1.5L
const formatCount = (value: number): string => {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);

  const units: Array<[number, string]> = [
    [10_000_000, 'Cr'],
    [100_000, 'L'],
    [1_000, 'K'],
  ];

  for (const [threshold, suffix] of units) {
    if (n >= threshold) {
      const scaled = n / threshold;
      // Decimal sirf jab value 10 se chhota ho (1.8K), warna round (12K)
      const text = scaled < 10
        ? scaled.toFixed(1).replace(/\.0$/, '')
        : String(Math.round(scaled));
      return `${text}${suffix}`;
    }
  }

  return String(n);
};

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
  likedBy = EMPTY_ARRAY,
  dislikes = 0,
  isDisliked,
  dislikedBy = EMPTY_ARRAY,
  isOwnPost,
  status,
  onLikePress,
  onDislikePress,
  onSharePress,
  onEditPress,
  onDeletePress,
  onProfilePress,
  onPostPress,
}: FeedCardProps) => {
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - wp('8%'));
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  const [isDislikesModalVisible, setIsDislikesModalVisible] = useState(false);
  const isReactingRef = useRef(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikedBy, setLocalLikedBy] = useState<any[]>(likedBy);
  const [localDislikes, setLocalDislikes] = useState(dislikes);
  const [localIsDisliked, setLocalIsDisliked] = useState(isDisliked);
  const [localDislikedBy, setLocalDislikedBy] = useState<any[]>(dislikedBy);
  // Real image dimensions se container ka aspect ratio — taaki image poori tarah
  // frame bhar le aur kahin khaali white/gray space na dikhe.
  const [imageRatios, setImageRatios] = useState<Record<number, number>>({});
  // Har index ke liye kis uri ka measure hua — crop/re-crop ke baad uri badalta hai,
  // tab stale ratio use hota aur frame galat size ka ho jata tha.
  const [measuredUris, setMeasuredUris] = useState<Record<number, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [measuredLines, setMeasuredLines] = useState(0);

  // Dono signals ka OR — jahan onTextLayout kaam kare wahan precise,
  // jahan na kare (FlatList) wahan char count se trigger.
  const isTruncatable =
    measuredLines > COLLAPSED_LINES || (text?.trim().length ?? 0) > COLLAPSED_CHARS;
  const isCollapsed = isTruncatable && !isExpanded;

  // Naya post/text aane par collapse state reset
  useEffect(() => {
    setIsExpanded(false);
    setMeasuredLines(0);
  }, [text]);

  const allImages = useMemo(() => {
    if (images && images.length > 0) return images;
    return image ? [image] : [];
  }, [images, image]);

  useEffect(() => {
    let cancelled = false;

    allImages.forEach((uri, idx) => {
      if (!uri || measuredUris[idx] === uri) return;

      Image.getSize(
        uri,
        (width, height) => {
          if (cancelled) return;
          if (width && height) {
            setImageRatios(prev => ({ ...prev, [idx]: clampFeedRatio(width / height) }));
          }
          setMeasuredUris(prev => ({ ...prev, [idx]: uri }));
        },
        () => {
          if (cancelled) return;
          setMeasuredUris(prev => ({ ...prev, [idx]: uri }));
        },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [allImages, measuredUris]);

  // Carousel ke content container ka `alignItems` default 'stretch' hota hai, isliye
  // alag-alag height ke slides sabse bali height tak stretch ho jaate hain aur chhoti
  // images ke neeche khaali space dikhta hai. Isliye POORE post ke liye ek hi ratio
  // use karte hain — sab slides same height, har image `cover` se clean crop.
  const uniformRatio = useMemo(() => {
    const known = allImages
      .map((_, idx) => imageRatios[idx])
      .filter((r): r is number => typeof r === 'number');

    if (known.length === 0) return 1;

    const avg = known.reduce((sum, r) => sum + r, 0) / known.length;
    return clampFeedRatio(avg);
  }, [allImages, imageRatios]);

  useEffect(() => {
    setLocalLikes(likes);
    setLocalIsLiked(isLiked);
    setLocalLikedBy(likedBy);
    setLocalDislikes(dislikes);
    setLocalIsDisliked(isDisliked);
    setLocalDislikedBy(dislikedBy);
  }, [comments, likes, isLiked, likedBy, dislikes, isDisliked, dislikedBy]);

  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const { getComments, commentPost, toggleLikePost, toggleDislikePost, deleteComment } = useHomeStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const loadComments = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await getComments(postId);
      console.log('Get comments response:', res);
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
        setLocalComments(mappedComments);
      }
    } catch (error) {
      console.log('Error loading comments:', error);
    }
  }, [postId, getComments, t]);

  useEffect(() => {
    if (isCommentsVisible && postId) {
      loadComments();
    }
  }, [isCommentsVisible, postId, loadComments]);

  const handleLikeButtonPress = async () => {
    if (isReactingRef.current) return;
    isReactingRef.current = true;

    let previousLikedBy: any[] = [];
    let previousDislikedBy: any[] = [];
    let previousLikesCount = 0;
    let previousDislikesCount = 0;
    let willBeLiked = false;
    let wasDisliked = false;

    try {
      if (onLikePress) {
        onLikePress();
      }

      if (!postId) return;

      previousLikedBy = [...localLikedBy];
      previousDislikedBy = [...localDislikedBy];
      previousLikesCount = localLikes;
      previousDislikesCount = localDislikes;
      willBeLiked = !localIsLiked;

      setLocalIsLiked(willBeLiked);
      setLocalLikes(prev => Math.max(willBeLiked ? prev + 1 : prev - 1, 0));

      setLocalLikedBy(prevLikedBy => {
        if (willBeLiked) {
          if (user?.id && !prevLikedBy.some(u => u.id === user.id)) {
            const currentUserLike = {
              id: user.id,
              name: user.name || t('common.you'),
              profile_pic: user.profile_pic || user.profile?.profile_pic,
              membership: user.profile?.membership || user.membership,
            };
            return [currentUserLike, ...prevLikedBy];
          }
          return prevLikedBy;
        } else {
          if (user?.id) {
            return prevLikedBy.filter(u => u.id !== user.id);
          }
          return prevLikedBy;
        }
      });

      wasDisliked = !!(willBeLiked && localIsDisliked);
      if (wasDisliked) {
        setLocalIsDisliked(false);
        setLocalDislikes(prev => Math.max(prev - 1, 0));
        setLocalDislikedBy(prev => user?.id ? prev.filter(u => u.id !== user.id) : prev);
      }

      if (wasDisliked) {
        await toggleDislikePost(postId);
      }
      const res = await toggleLikePost(postId);
      console.log('FeedCard local like response:', res);
    } catch (error) {
      console.log('Error toggling like:', error);
      setLocalIsLiked(!willBeLiked);
      setLocalLikes(previousLikesCount);
      setLocalLikedBy(previousLikedBy);
      if (wasDisliked) {
        setLocalIsDisliked(true);
        setLocalDislikes(previousDislikesCount);
        setLocalDislikedBy(previousDislikedBy);
      }
    } finally {
      isReactingRef.current = false;
    }
  };

  const handleDislikeButtonPress = async () => {
    if (isReactingRef.current) return;
    isReactingRef.current = true;

    let previousDislikedBy: any[] = [];
    let previousLikedBy: any[] = [];
    let previousLikesCount = 0;
    let previousDislikesCount = 0;
    let willBeDisliked = false;
    let wasLiked = false;

    try {
      if (onDislikePress) {
        onDislikePress();
      }

      if (!postId) return;

      previousDislikedBy = [...localDislikedBy];
      previousLikedBy = [...localLikedBy];
      previousLikesCount = localLikes;
      previousDislikesCount = localDislikes;
      willBeDisliked = !localIsDisliked;

      setLocalIsDisliked(willBeDisliked);
      setLocalDislikes(prev => Math.max(willBeDisliked ? prev + 1 : prev - 1, 0));

      setLocalDislikedBy(prevDislikedBy => {
        if (willBeDisliked) {
          if (user?.id && !prevDislikedBy.some(u => u.id === user.id)) {
            const currentUserDislike = {
              id: user.id,
              name: user.name || t('common.you'),
              profile_pic: user.profile_pic || user.profile?.profile_pic,
              membership: user.profile?.membership || user.membership,
            };
            return [currentUserDislike, ...prevDislikedBy];
          }
          return prevDislikedBy;
        } else {
          if (user?.id) {
            return prevDislikedBy.filter(u => u.id !== user.id);
          }
          return prevDislikedBy;
        }
      });

      wasLiked = !!(willBeDisliked && localIsLiked);
      if (wasLiked) {
        setLocalIsLiked(false);
        setLocalLikes(prev => Math.max(prev - 1, 0));
        setLocalLikedBy(prev => user?.id ? prev.filter(u => u.id !== user.id) : prev);
      }

      if (wasLiked) {
        await toggleLikePost(postId);
      }
      const res = await toggleDislikePost(postId);
      console.log('FeedCard local dislike response:', res);
    } catch (error) {
      console.log('Error toggling dislike:', error);
      setLocalIsDisliked(!willBeDisliked);
      setLocalDislikes(previousDislikesCount);
      setLocalDislikedBy(previousDislikedBy);
      if (wasLiked) {
        setLocalIsLiked(true);
        setLocalLikes(previousLikesCount);
        setLocalLikedBy(previousLikedBy);
      }
    } finally {
      isReactingRef.current = false;
    }
  };

  const handleShare = async () => {
    if (onSharePress) {
      onSharePress();
      return;
    }
    try {
      const postLink = postId ? `https://gst.tambimotors.com/post/${postId}` : '';
      const shareMessage = t('feed.shareMessage', {
        author,
        text: (text || '').slice(0, 120) + (text && text.length > 120 ? '...' : ''),
        link: postLink,
      });
      if (!postLink) {
        await Share.share({ message: shareMessage });
        return;
      }
      await Share.share({
        message: shareMessage,
        title: author,
        url: postLink,
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert(t('common.error'), error.message);
      }
    }
  };

  const handleAddComment = async (commentText: string) => {
    const tempId = Math.random().toString();
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

    setLocalComments(prev => [...prev, newComment]);

    if (postId) {
      try {
        const res = await commentPost(postId, commentText);
        console.log('Comment post response:', res);
        loadComments();
      } catch (error) {
        console.log('Error posting comment:', error);
        setLocalComments(prev => prev.filter(c => c.id !== tempId));
        Alert.alert(t('common.error'), t('postDetails.commentFailed'));
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
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.feedAvatar} />
          ) : (
            <View style={[styles.feedAvatar, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
              <Text style={{ fontSize: RFValue(12), fontWeight: '700', color: Colors.dark }}>
                {(author || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
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
          {images.map((imgUri, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.carouselImageWrapper, { width: cardWidth }]}
                activeOpacity={0.95}
                onPress={onPostPress}
                disabled={!onPostPress}
              >
                <Image
                  source={{ uri: imgUri }}
                  style={[styles.carouselImage, { aspectRatio: uniformRatio }]}
                  resizeMode="cover"
                />
                {images.length > 1 && (
                  <View style={styles.carouselBadge}>
                    <Text style={styles.carouselBadgeText}>{idx + 1} / {images.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        image && (
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={onPostPress}
            disabled={!onPostPress}
            style={[styles.carouselImageWrapper, { width: cardWidth }]}
          >
            <Image
              source={{ uri: image }}
              style={[styles.carouselImage, { aspectRatio: uniformRatio }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )
      )}

      

      {/* Card Actions */}
      <View style={styles.feedActions}>
        <View style={styles.feedActionItem}>
          <TouchableOpacity onPress={handleLikeButtonPress} activeOpacity={0.7} style={styles.actionIconBtn}>
            <ThumbsUp
              size={RFValue(14)}
              color={localIsLiked ? Colors.primary : Colors.gray}
              fill={localIsLiked ? Colors.primary : 'none'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLikesModalVisible(true)} activeOpacity={0.7}>
            <Text style={[styles.feedActionText, localIsLiked && styles.activeActionText]}>
              {formatCount(localLikes)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.feedActionItem}>
          <TouchableOpacity onPress={handleDislikeButtonPress} activeOpacity={0.7} style={styles.actionIconBtn}>
            <ThumbsDown
              size={RFValue(14)}
              color={localIsDisliked ? '#EF4444' : Colors.gray}
              fill={localIsDisliked ? '#EF4444' : 'none'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => setIsDislikesModalVisible(true)} activeOpacity={0.7}> */}
            <Text style={[styles.feedActionText, localIsDisliked && { color: '#EF4444' }]}>
              {formatCount(localDislikes)}
            </Text>
          {/* </TouchableOpacity> */}
        </View>
        {/* <View style={styles.feedActionItem}>
          <TouchableOpacity onPress={handleCommentButtonPress} activeOpacity={0.7} style={styles.actionIconBtn}>
            <MessageSquare size={RFValue(14)} color={Colors.gray} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.feedActionText}>{commentsCount}</Text>
        </View> */}
        <TouchableOpacity style={styles.actionIconBtn} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={RFValue(14)} color={Colors.gray} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Card Description — collapse + Read more */}
      {text?.trim() ? (
        <View style={styles.feedDescription}>
          <TouchableOpacity activeOpacity={0.95} onPress={onPostPress} disabled={!onPostPress}>
            <Text
              style={styles.feedText}
              numberOfLines={isCollapsed ? COLLAPSED_LINES : undefined}
              onTextLayout={e => {
                // Truncate karte waqt sirf 3 lines hi report hote hain,
                // isliye us state me measure ko ignore karo ( warna loop ban jayega).
                if (isCollapsed) return;
                const lines = e.nativeEvent.lines.length;
                if (lines !== measuredLines) setMeasuredLines(lines);
              }}
            >
              {text}
            </Text>
          </TouchableOpacity>

          {isTruncatable && (
            <View style={styles.readMoreRow}>
              <TouchableOpacity
                onPress={() => setIsExpanded(prev => !prev)}
                activeOpacity={0.8}
                style={styles.readMoreBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.readMoreText}>
                  {isExpanded ? t('common.readLess') : t('common.readMore')}
                </Text>
                <ChevronDown
                  size={RFValue(10)}
                  color={Colors.primary}
                  strokeWidth={2.6}
                  style={[
                    styles.readMoreIcon,
                    isExpanded && styles.readMoreIconOpen,
                  ]}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}

      {/* Reusable Comments Bottom Sheet Modal */}
      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        comments={localComments}
        onAddComment={handleAddComment}
        currentUserId={user?.id?.toString()}
        onDeleteComment={(commentId) => {
          Alert.alert(t('postDetails.deleteComment'), t('postDetails.deleteCommentConfirm'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                setLocalComments(prev => prev.filter(c => c.id !== commentId));

                try {
                  const res = await deleteComment(commentId);
                  console.log('Comment delete api res ', res)
                  console.log('Comment deleted successfully');
                } catch (error) {
                  console.log('Failed to delete comment from server', error);
                  Alert.alert(t('common.error'), t('postDetails.commentDeleteFailed'));
                }
              }
            }
          ]);
        }}
      />
      {/* Reusable Likes Modal */}
      <LikesModal
        visible={isLikesModalVisible}
        onClose={() => setIsLikesModalVisible(false)}
        likedBy={localLikedBy}
      />
      {/* Reusable Dislikes Modal */}
      <DislikesModal
        visible={isDislikesModalVisible}
        onClose={() => setIsDislikesModalVisible(false)}
        dislikedBy={localDislikedBy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  feedCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: wp('2%'),
    paddingVertical: 3,
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
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('5%'),
    marginRight: wp('3%'),
  },
  textContainer: {
    flex: 1,
  },
  feedAuthor: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  feedMeta: {
    fontSize: RFValue(9),
    color: Colors.gray,
    marginTop: hp('0.1%'),
  },
  feedDescription: {
    marginBottom: hp('1.5%'),
  },
  feedText: {
    fontSize: RFValue(11.5),
    color: '#333333',
    lineHeight: RFValue(16),
  },
  readMoreRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp('0.6%'),
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: '#FFE0D2',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
  },
  readMoreText: {
    fontSize: RFValue(9),
    fontWeight: '700',
    color: Colors.primary,
  },
  readMoreIcon: {
    transform: [{ rotate: '0deg' }],
  },
  readMoreIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: hp('1%'),
    gap: wp('4%'),
  },
  feedActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: wp('1%'),
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
    // aspectRatio is set per-image from real dimensions; container always hugs the image.
    width: '100%',
    marginBottom: 0,
    backgroundColor: '#F5F5F5',
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

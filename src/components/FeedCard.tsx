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

interface FeedCardProps {
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
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onProfilePress?: () => void;
  onPostPress?: () => void;
}

export const FeedCard = ({
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
  onLikePress,
  onCommentPress,
  onSharePress,
  onEditPress,
  onDeletePress,
  onProfilePress,
  onPostPress,
}: FeedCardProps) => {
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - wp('12%'));
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [localComments, setLocalComments] = useState<Comment[]>([
    { id: '1', author: 'Rahul Sharma', text: 'Beautiful cows! Jai Sri Ram.', time: '2h', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '2', author: 'Priya Patel', text: 'So peaceful.', time: '1h', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  ]);

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

  const handleAddComment = (commentText: string) => {
    const newComment: Comment = {
      id: String(localComments.length + 1),
      author: 'Ananda Das', // Mock current user
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150', // Mock avatar
      text: commentText,
      time: 'Just now',
    };

    setLocalComments(prev => [...prev, newComment]);
    setCommentsCount(prev => prev + 1);
  };

  return (
    <View 
      style={styles.feedCard}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0) {
          setCardWidth(width - wp('8%')); // Subtract horizontal padding
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
            <TouchableOpacity onPress={onEditPress} style={styles.headerActionBtn} activeOpacity={0.7}>
              <Pencil size={RFValue(11)} color={Colors.primary} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDeletePress} style={[styles.headerActionBtn, styles.deleteBtn]} activeOpacity={0.7}>
              <Trash2 size={RFValue(11)} color="#EF4444" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity activeOpacity={0.95} onPress={onPostPress} disabled={!onPostPress}>
        {/* Card Image or Carousel */}
        {images && images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
          >
            {images.map((imgUri, idx) => (
              <View key={idx} style={[styles.carouselImageWrapper, { width: cardWidth }]}>
                <Image source={{ uri: imgUri }} style={styles.feedImage} resizeMode="cover" />
                {images.length > 1 && (
                  <View style={styles.carouselBadge}>
                    <Text style={styles.carouselBadgeText}>{idx + 1} / {images.length}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          image && (
            <Image
              source={{ uri: image }}
              style={styles.feedImage}
              resizeMode="cover"
            />
          )
        )}

        {/* Card Description */}
        <Text style={styles.feedText}>{text}</Text>
      </TouchableOpacity>

      {/* Card Actions */}
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.feedActionItem} onPress={onLikePress} activeOpacity={0.7}>
          <Heart
            size={RFValue(14)}
            color={isLiked ? Colors.primary : Colors.gray}
            fill={isLiked ? Colors.primary : 'none'}
            strokeWidth={1.5}
          />
          <Text style={[styles.feedActionText, isLiked && styles.activeActionText]}>
            {likes}
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
    padding: wp('4%'),
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

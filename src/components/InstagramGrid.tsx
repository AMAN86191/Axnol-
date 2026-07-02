import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Layers, FileText } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

interface PostItem {
  id: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface InstagramGridProps {
  posts: PostItem[];
  onPostPress: (postId: string) => void;
}

export const InstagramGrid = React.memo(({ posts, onPostPress }: InstagramGridProps) => {
  return (
    <View style={styles.gridContainer}>
      {posts.map((item) => {
        const isMultiImage = item.images && item.images.length > 1;
        const hasImage = !!(item.image || (item.images && item.images.length > 0));
        const thumbnailUri = item.image ? item.image : (item.images && item.images.length > 0 ? item.images[0] : null);

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => onPostPress(item.id)}
          >
            {hasImage && thumbnailUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
                {isMultiImage && (
                  <View style={styles.badgeContainer}>
                    <Layers size={RFValue(10)} color="#FFF" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.textPlaceholder}>
                <FileText size={RFValue(12)} color="#FF6F34" style={{ marginBottom: hp('0.3%') }} />
                <Text style={styles.placeholderSnippet} numberOfLines={3}>
                  {item.text}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: wp('29%'), // 3 columns with space
    aspectRatio: 1,
    margin: wp('0.8%'),
    borderRadius: wp('2%'),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: wp('1.5%'),
    right: wp('1.5%'),
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: wp('1.5%'),
    padding: wp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('2%'),
    borderWidth: 1.5,
    borderColor: '#FFEBE0',
    borderRadius: wp('2.5%'),
  },
  placeholderSnippet: {
    fontSize: RFValue(7.5),
    color: '#FF6F34',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: hp('1.2%'),
  },
});

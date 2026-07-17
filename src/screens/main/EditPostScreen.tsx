import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { CustomButton } from '../../components/CustomButton';
import useHomeStore from '../../zustand/useHomeStore';
import { RootStackParamList } from '../../navigation/types';

type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPostScreen'>;

const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditPostScreenRouteProp>();
  const { post } = route.params as any;
  const { updatePostStore, deletePostImageStore } = useHomeStore();

  const [caption, setCaption] = useState(post?.text || '');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const captionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (post) {
      setCaption(post.text);
      setImages(post.images || (post.image ? [post.image] : []));
    } else {
      Alert.alert('Error', 'Post not found.');
      navigation.goBack();
    }
  }, [post]);

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 images per post.');
      return;
    }

    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: 5 - images.length,
          quality: 0.8,
          maxWidth: 1080,
          maxHeight: 1080,
        },
        response => {
          if (response.didCancel) return;
          if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Failed to select image');
            return;
          }

          if (response.assets) {
            const validAssets = response.assets.filter(asset => {
              const type = asset.type || '';
              const fileName = asset.fileName || '';
              return /image\/(jpe?g|png)/i.test(type) || /\.(jpe?g|png)$/i.test(fileName);
            });

            if (validAssets.length < response.assets.length) {
              Alert.alert('Invalid Format', 'Only JPG, JPEG, and PNG images are supported. Other formats were skipped.');
            }

            const pickedUris = validAssets.map(asset => asset.uri).filter((uri): uri is string => !!uri);

            setImages(prev => {
              const updated = [...prev, ...pickedUris];
              return updated.slice(0, 5); // strict ceiling of 5
            });
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeImage = async (index: number) => {
    const imgToRemove = images[index];
    // Check if it's a server image and we have original_post_images
    if (imgToRemove.startsWith('http') && post?.original_post_images) {
      // Find the image ID based on the URL
      const foundImage = post.original_post_images.find((pi: any) => 
        `https://gst.tambimotors.com/${pi.post_img}` === imgToRemove
      );
      
      if (foundImage) {
        try {
          // Send request to server to delete image
          await deletePostImageStore(post.id, foundImage.id);
          console.log(`Image ${foundImage.id} deleted successfully from server.`);
        } catch (error) {
          Alert.alert('Error', 'Failed to delete this image from the server.');
          return; // Do not remove from UI if API failed
        }
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!post) return null;




  const handleSavePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Validation Error', 'Please enter a caption.');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('id', post.id);
      formData.append('description', caption);
      
      // Keep track of old and new images, or simply send new ones
      // Since it's update, depending on API, it might just need the new images or all.
      // Append images to FormData
      images.forEach((img, index) => {
        if (!img.startsWith('http')) {
          // New local image
          const fileName = img.split('/').pop() || `image_${index}.jpg`;
          const type = img.endsWith('png') ? 'image/png' : 'image/jpeg';
          formData.append(`post_img[]`, {
            uri: img,
            name: fileName,
            type: type,
          } as any);
        }
      });

   console.log('formData', formData)
     const res =  await updatePostStore(formData);
  console.log('edit post res', res)
      Alert.alert('Success 🎉', 'Post updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Update post error:', error);
      Alert.alert('Error', 'Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <CommonHeader title="Edit Post" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

          {/* Photos Header */}
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>Photos</Text>
            <Text style={styles.photoSectionSubtitle}>{images.length} / 5</Text>
          </View>

          {/* Swipable Selected Photos List */}
          <View style={styles.photosWrapper}>
            {images.length === 0 ? (
              <TouchableOpacity style={styles.addPhotosBox} onPress={pickImages} activeOpacity={0.7}>
                <ImageIcon size={34} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.addPhotosTitle}>Upload Photos (Up to 5)</Text>
                <Text style={styles.addPhotosSubtitle}>Tap to choose JPG, JPEG or PNG files</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScrollList}>
                {images.map((item, index) => (
                  <View key={index} style={styles.photoThumbContainer}>
                    <Image source={{ uri: item }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.deleteThumbBtn}
                      onPress={() => removeImage(index)}
                      activeOpacity={0.7}
                    >
                      <X size={10} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                {images.length < 5 && (
                  <TouchableOpacity style={styles.addMoreCardBtn} onPress={pickImages} activeOpacity={0.7}>
                    <ImageIcon size={20} color={Colors.primary} strokeWidth={1.8} />
                    <Text style={styles.addMoreCardBtnText}>Add More</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* Caption Box */}
          <View style={styles.captionBox}>
            <TextInput
              ref={captionInputRef}
              style={styles.captionInput}
              placeholder="Edit your caption..."
              placeholderTextColor="#999"
              multiline
              value={caption}
              onChangeText={(text) => {
                if (text.length <= 500) {
                  setCaption(text);
                }
              }}
              maxLength={500}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              selection={selection}
            />
            <View style={styles.captionFooter}>
            
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>
          </View>

          <CustomButton
            title="Save Changes"
            loading={loading}
            onPress={handleSavePost}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  photoSectionTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  photoSectionSubtitle: {
    fontSize: RFValue(11),
    color: Colors.gray,
    fontWeight: '500',
  },
  photosWrapper: {
    width: '100%',
    marginBottom: hp('2.5%'),
  },
  addPhotosBox: {
    width: '100%',
    height: hp('22%'),
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1.5,
    borderColor: '#FFE0D0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
  },
  addPhotosTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: Colors.primary,
    marginTop: hp('1.2%'),
  },
  addPhotosSubtitle: {
    fontSize: RFValue(9),
    color: Colors.gray,
    marginTop: hp('0.5%'),
  },
  photosScrollList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
  },
  photoThumbContainer: {
    width: wp('26%'),
    height: wp('26%'),
    borderRadius: wp('3%'),
    position: 'relative',
    marginRight: wp('3.2%'),
    borderWidth: 1,
    borderColor: '#FFE5D8',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    borderRadius: wp('2.8%'),
  },
  deleteThumbBtn: {
    position: 'absolute',
    top: -wp('1%'),
    right: -wp('1%'),
    backgroundColor: '#EF4444',
    width: wp('5.5%'),
    height: wp('5.5%'),
    borderRadius: wp('2.75%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  addMoreCardBtn: {
    width: wp('26%'),
    height: wp('26%'),
    backgroundColor: '#FFFBF9',
    borderRadius: wp('3%'),
    borderWidth: 1.2,
    borderColor: '#FFE5D8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreCardBtnText: {
    fontSize: RFValue(9.5),
    fontWeight: '700',
    color: Colors.primary,
    marginTop: hp('0.5%'),
  },
  captionBox: {
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#FFE0D0',
    padding: wp('3.5%'),
    marginBottom: hp('3%'),
  },
  captionInput: {
    fontSize: RFValue(12),
    color: Colors.dark,
    minHeight: hp('14%'),
    textAlignVertical: 'top',
    padding: 0,
  },
  captionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: hp('1.5%'),
    marginTop: hp('1.5%'),
  },
  captionIconsRow: {
    flexDirection: 'row',
  },
  captionIconBtn: {
    marginRight: wp('4%'),
    padding: wp('1%'),
  },
  captionIconBtnActive: {
    backgroundColor: '#FFE5D9',
    borderRadius: wp('1.5%'),
  },
  charCount: {
    fontSize: RFValue(10),
    color: Colors.gray,
    alignSelf: 'flex-end',
  },
  emojiPanel: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: hp('1%'),
    paddingTop: hp('1%'),
    height: hp('22%'),
  },
  emojiTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: hp('0.5%'),
  },
  emojiTab: {
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('2.5%'),
    borderRadius: wp('2%'),
  },
  emojiTabActive: {
    backgroundColor: '#FFE5D9',
  },
  emojiTabText: {
    fontSize: RFValue(11),
    color: Colors.gray,
    fontWeight: '600',
  },
  emojiTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: hp('2%'),
  },
  emojiGridCell: {
    width: wp('10.5%'),
    height: wp('10.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp('0.5%'),
  },
  emojiGridText: {
    fontSize: RFValue(20),
  },
  helperPanel: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: hp('1%'),
    paddingTop: hp('1%'),
  },
  helperPanelTitle: {
    fontSize: RFValue(10.5),
    fontWeight: '700',
    color: Colors.gray,
    marginBottom: hp('0.8%'),
    paddingLeft: wp('1%'),
  },
  helperScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
  },
  mentionChip: {
    backgroundColor: '#E8F4FD',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.8%'),
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: '#D4E6F1',
  },
  mentionChipText: {
    color: '#1DA1F2',
    fontWeight: '700',
    fontSize: RFValue(10.5),
  },
  hashtagChip: {
    backgroundColor: '#E8F8F5',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.8%'),
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: '#D1F2EB',
  },
  hashtagChipText: {
    color: '#16A085',
    fontWeight: '700',
    fontSize: RFValue(10.5),
  },
  saveButton: {
    marginTop: hp('1.5%'),
    marginBottom: hp('3%'),
  },
});

export default EditPostScreen;

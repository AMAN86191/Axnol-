import React, { useState, useRef } from 'react';
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
  Modal,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import {
  Image as ImageIcon,
  X,
  Eye,
  CheckCircle,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../theme/colors';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { CustomButton } from '../../components/CustomButton';
import { FeedCard } from '../../components/FeedCard';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';

const AddScreen = () => {
  const navigation = useNavigation();
  const { createPost, loading: isCreatingPost } = useHomeStore();
  const { user } = useAuthStore();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const captionInputRef = useRef<TextInput>(null);







  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 images per post.');
      return;
    }

    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: 5 - images.length, // Let them select up to remaining empty slots
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

            setImages(prev => {
              const updated = [...prev, ...validAssets];
              return updated.slice(0, 5); // strict ceiling of 5
            });
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateInputs = (): boolean => {
    if (images.length === 0 && !caption.trim()) {
      Alert.alert('Validation Error ⚠️', 'Please provide either a photo or a caption for your post.');
      return false;
    }

    return true;
  };

  const handlePublishClick = () => {
    if (validateInputs()) {
      setIsPreviewVisible(true);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      setLoading(true);
      setIsPreviewVisible(false);

      const formData = new FormData();
      formData.append('description', caption);

      images.forEach((img, index) => {
        formData.append('post_img[]', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image_${index}.jpg`,
        } as any);
      });

      const response = await createPost(formData);
      console.log('post create response', response);
      if (response?.status || response?.status === true || response?.status_code === 201) {

        ToastAndroid.show('your post is under review', ToastAndroid.LONG);
        // Reset
        setCaption('');
        setImages([]);
        // Redirect to feed
        navigation.navigate('FeedScreen' as never);
      } else {
        Alert.alert('Error', response?.message || 'Failed to publish post.');
      }
    } catch (error: any) {
      console.log('Post error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <PrimaryHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

          {/* Selected Photos Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>{images.length} / 5</Text>
          </View>

          {/* Upload Box or Horizontal Swipable List */}
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
                    <Image source={{ uri: item.uri }} style={styles.photoThumb} />
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
              placeholder="Share updates, activities, or devotional thoughts..."
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

          {/* Trigger Button: Shows Preview first */}
          <CustomButton
            title="Publish Post"
            loading={loading}
            onPress={handlePublishClick}
            style={styles.publishBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Live Preview Modal --- */}
      <Modal
        visible={isPreviewVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleContainer}>
                <Eye size={RFValue(14)} color={Colors.primary} style={{ marginRight: wp('1.5%') }} />
                <Text style={styles.modalTitleText}>Post Preview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPreviewVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <X size={RFValue(14)} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.previewTipText}>This is how your post will appear in the community feed:</Text>

              {/* WYSIWYG Feed Card rendering */}
              <FeedCard
                author={user?.name || 'Community Member'}
                avatar={user?.profile?.profile_pic ? `${user.profile.profile_pic}` : 'https://randomuser.me/api/portraits/lego/1.jpg'}
                meta={`Just now${user?.profile?.designation ? ` • ${user.profile.designation}` : ''}`}
                text={caption.trim()}
                images={images.map(img => img.uri)}
                likes={0}
                comments={0}
                isLiked={false}
              />
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.editBackBtn}
                onPress={() => setIsPreviewVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.editBackBtnText}>Edit Content</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPublishBtn}
                onPress={handleConfirmPublish}
                activeOpacity={0.85}
              >
                <CheckCircle size={RFValue(11)} color="#FFF" style={{ marginRight: wp('1.5%') }} />
                <Text style={styles.confirmPublishBtnText}>Publish Now</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

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
    paddingTop: hp('1%'),
    paddingBottom: hp('12%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  sectionSubtitle: {
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
    marginBottom: hp('2.5%'),
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
    justifyContent: "flex-end",
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

  },

  publishBtn: {
    marginTop: hp('1%'),
    marginBottom: hp('3%'),
  },

  /* --- Preview Modal Styling --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 24, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    maxHeight: hp('85%'),
    paddingTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: Colors.dark,
  },
  modalCloseBtn: {
    padding: wp('1.5%'),
    backgroundColor: '#F5F5F5',
    borderRadius: wp('4%'),
  },
  modalBody: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  previewTipText: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    fontWeight: '500',
    marginBottom: hp('2%'),
    lineHeight: RFValue(14),
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.2%'),
    paddingBottom: Platform.OS === 'ios' ? hp('4.5%') : hp('3.5%'),
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    backgroundColor: '#FAFBFB',
  },
  editBackBtn: {
    flex: 1,
    height: hp('5.2%'),
    borderRadius: wp('3%'),
    borderWidth: 1.2,
    borderColor: '#FFE0D0',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3.5%'),
  },
  editBackBtnText: {
    color: Colors.primary,
    fontSize: RFValue(11.5),
    fontWeight: '700',
  },
  confirmPublishBtn: {
    flex: 1.3,
    height: hp('5.2%'),
    backgroundColor: Colors.primary,
    borderRadius: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmPublishBtnText: {
    color: Colors.white,
    fontSize: RFValue(11.5),
    fontWeight: '800',
  },
});

export default AddScreen;

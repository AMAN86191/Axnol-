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
  ActivityIndicator,
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
import ImageCropPicker from 'react-native-image-crop-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Colors } from '../../theme/colors';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { CustomButton } from '../../components/CustomButton';
import { FeedCard } from '../../components/FeedCard';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';
import { useTranslation } from 'react-i18next';

// Instagram feed ke supported aspect ratios aur unke exact output pixels.
type AspectRatio = 'square' | 'portrait' | 'landscape';

const ASPECT_DIMS: Record<AspectRatio, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },   // 1:1
  portrait: { width: 1080, height: 1350 }, // 4:5  (Instagram max height)
  landscape: { width: 1920, height: 1080 }, // 16:9
};

const MAX_IMAGES = 5;

// ImageCropPicker Android par `file://` prefix ke bina path deta hai,
// lekin ImageResizer ko proper file URI chahiye.
const toFileUri = (path: string): string =>
  path.startsWith('file://') || path.startsWith('content://') ? path : `file://${path}`;

// Picked images ka asli width/height nikal kar ratio ka andaaza lagata hai.
// Portrait-ish: ratio < 0.95, landscape-ish: ratio > 1.05, baaki (square/odd) ke liye
// default square. Sab images ek hi ratio me jate hain taaki upload ek hi size ka ho.
const detectAspectRatio = async (rawList: any[]): Promise<AspectRatio> => {
  const ratios: number[] = await Promise.all(
    rawList.map(
      img =>
        new Promise<number>(resolve => {
          Image.getSize(
            toFileUri(img.path),
            (w, h) => resolve(h > 0 ? w / h : 0),
            () => resolve(0),
          );
        }),
    ),
  );

  const valid = ratios.filter(r => r > 0);
  if (valid.length === 0) return 'square';

  const allPortrait = valid.every(r => r < 0.95);
  const allLandscape = valid.every(r => r > 1.05);

  if (allPortrait) return 'portrait';
  if (allLandscape) return 'landscape';

  // Square / mixed / unknown -> square sabse safe hai
  return 'square';
};

const AddScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { createPost, loading: isCreatingPost } = useHomeStore();
  const { user } = useAuthStore();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Instagram-style: original picked images (crop karne ke liye base)
  const [rawImages, setRawImages] = useState<any[]>([]);
  // null = user ne abhi aspect ratio choose nahi kiya. Publish tab tak
  // blocked rahega, taaki kabhi bhi raw (full-res, wrong ratio) image upload na ho.
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const captionInputRef = useRef<TextInput>(null);







  const pickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(t('addPost.limitReached'), t('addPost.limitMessage'));
      return;
    }

    try {
      const maxCount = MAX_IMAGES - images.length;

      // Step 1: Gallery se multiple images select karo (original, bina crop)
      const picked = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        multiple: true,
        maxFiles: maxCount,
      });

      if (!picked || picked.length === 0) return;

      // Raw images store karo (crop ka base) aur immediately preview dikhao
      const selectedRaw = picked.map((img: any) => ({
        uri: img.path,
        type: img.mime || 'image/jpeg',
        fileName: img.filename || img.path.split('/').pop() || 'image.jpg',
        path: img.path,
      }));

      let nextRaw = [...rawImages, ...selectedRaw].slice(0, MAX_IMAGES);
      setRawImages(nextRaw);

      // Preview turant dikhao (raw), phir detect karke khud hi crop kar do
      setSelectedAspect(null);
      setImages(nextRaw.map((img: any) => ({
        uri: img.path,
        type: img.mime || 'image/jpeg',
        fileName: img.filename || img.path.split('/').pop() || 'image.jpg',
      })));

      // Auto-detect + auto-crop: user ke chip click kiye bina hi sab images
      // ek hi size me set ho jati hain.
      const detected = await detectAspectRatio(nextRaw);
      setIsCropping(true);
      try {
        const processed = await cropImagesToAspect(nextRaw, detected);
        setImages(processed);
        setSelectedAspect(detected);
      } catch (cropErr: any) {
        console.log('Auto crop error:', cropErr);
        Alert.alert(t('common.error'), t('addPost.selectImageFailed'));
      } finally {
        setIsCropping(false);
      }
    } catch (error: any) {
      // User cancelled — koi problem nahi
      if (error?.code !== 'E_PICKER_CANCELLED' && error?.message !== 'User cancelled image selection') {
        console.log('Error selecting images:', error);
        Alert.alert(t('common.error'), t('addPost.selectImageFailed'));
      }
    }
  };

  // SAB images ko ek hi aspect ratio me center-crop + resize kar deta hai.
  // mode: 'cover' => stretch nahi, exact width x height, zero white space.
  const cropImagesToAspect = async (
    rawList: any[],
    aspect: AspectRatio,
  ): Promise<any[]> => {
    const target = ASPECT_DIMS[aspect];
    const processed: any[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const resized = await ImageResizer.createResizedImage(
        toFileUri(rawList[i].path),
        target.width,
        target.height,
        'JPEG',
        90, // Instagram-quality compression
        0, // rotation
        undefined,
        false, // strip EXIF/GPS metadata
        { mode: 'cover', onlyScaleDown: false },
      );

      processed.push({
        uri: resized.uri,
        type: 'image/jpeg',
        fileName: resized.name || `post_${i + 1}.jpg`,
        path: resized.path,
      });
    }

    return processed;
  };

  // Ratio chip tap karne par — override ke liye
  const applyAspectRatio = async (aspect: AspectRatio) => {
    if (rawImages.length === 0) return;

    setIsCropping(true);
    try {
      const processed = await cropImagesToAspect(rawImages, aspect);
      setImages(processed);
      setSelectedAspect(aspect);
    } catch (error: any) {
      console.log('Auto crop error:', error);
      Alert.alert(t('common.error'), t('addPost.selectImageFailed'));
    } finally {
      setIsCropping(false);
    }
  };

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
    setRawImages(prev => prev.filter((_, i) => i !== index));
    // Saare image hat gaye to ratio selection bhi reset
    if (nextImages.length === 0) setSelectedAspect(null);
  };

  const validateInputs = (): boolean => {
    if (images.length === 0 && !caption.trim()) {
      Alert.alert(t('addPost.validationError'), t('addPost.validationMessage'));
      return false;
    }

    // Image hai par ratio nahi chuna — publish mat karo, warna raw image jayegi
    if (images.length > 0 && !selectedAspect) {
      Alert.alert(t('addPost.validationError'), t('addPost.aspectRequired'));
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

        ToastAndroid.show(t('addPost.underReview'), ToastAndroid.LONG);
        // Reset
        setCaption('');
        setImages([]);
        // Redirect to feed
        navigation.navigate('FeedScreen' as never);
      } else {
        Alert.alert(t('common.error'), response?.message || t('addPost.publishFailed'));
      }
    } catch (error: any) {
      console.log('Post error:', error);
      const errorMsg = error.response?.data?.message || error.message || t('addPost.unexpectedError');
      Alert.alert(t('common.error'), errorMsg);
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
            <Text style={styles.sectionTitle}>{t('addPost.photos')}</Text>
            <Text style={styles.sectionSubtitle}>{images.length} / 5</Text>
          </View>

          {/* Upload Box or Horizontal Swipable List */}
          <View style={styles.photosWrapper}>
            {images.length === 0 ? (
              <TouchableOpacity style={styles.addPhotosBox} onPress={pickImages} activeOpacity={0.7}>
                <ImageIcon size={34} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.addPhotosTitle}>{t('addPost.uploadPhotos')}</Text>
                <Text style={styles.addPhotosSubtitle}>{t('addPost.uploadSubtitle')}</Text>
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
                    <Text style={styles.addMoreCardBtnText}>{t('addPost.addMore')}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* Instagram-style Aspect Ratio Selector */}
          {images.length > 0 && (
            <View style={styles.aspectSection}>
              <Text style={styles.aspectTitle}>{t('addPost.aspectTitle')}</Text>
              <View style={styles.aspectRow}>
                {(
                  [
                    { key: 'square', label: t('addPost.aspectSquare') },
                    { key: 'portrait', label: t('addPost.aspectPortrait') },
                    { key: 'landscape', label: t('addPost.aspectLandscape') },
                  ] as const
                ).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.aspectChip,
                      selectedAspect === opt.key && styles.aspectChipActive,
                    ]}
                    activeOpacity={0.7}
                    disabled={isCropping}
                    onPress={() => applyAspectRatio(opt.key)}
                  >
                    {/* Mini shape icon */}
                    <View
                      style={[
                        styles.aspectShape,
                        { aspectRatio: opt.key === 'square' ? 1 : opt.key === 'portrait' ? 4 / 5 : 16 / 9 },
                        selectedAspect === opt.key && styles.aspectShapeActive,
                      ]}
                    />
                    <Text style={[styles.aspectChipText, selectedAspect === opt.key && styles.aspectChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isCropping ? (
                <View style={styles.croppingIndicator}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.croppingText}>{t('addPost.cropping')}</Text>
                </View>
              ) : !selectedAspect ? (
                <Text style={styles.aspectRequiredText}>{t('addPost.aspectRequired')}</Text>
              ) : null}
            </View>
          )}

          {/* Caption Box */}
          <View style={styles.captionBox}>
            <TextInput
              ref={captionInputRef}
              style={styles.captionInput}
              placeholder={t('addPost.captionPlaceholder')}
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
            title={t('addPost.publishPost')}
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
                <Text style={styles.modalTitleText}>{t('addPost.postPreview')}</Text>
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
              <Text style={styles.previewTipText}>{t('addPost.previewTip')}</Text>

              {/* WYSIWYG Feed Card rendering */}
              <FeedCard
                author={user?.name || t('addPost.communityMember')}
                avatar={user?.profile?.profile_pic ? `${user.profile.profile_pic}` : ''}
                meta={`${t('common.justNow')}${user?.profile?.designation ? ` • ${user.profile.designation}` : ''}`}
                text={caption.trim()}
                images={images.map(img => img.uri)}
                likes={0}
                comments={0}
                isLiked={false}
                dislikes={0}
                isDisliked={false}
              />
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.editBackBtn}
                onPress={() => setIsPreviewVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.editBackBtnText}>{t('addPost.editContent')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPublishBtn}
                onPress={handleConfirmPublish}
                activeOpacity={0.85}
              >
                <CheckCircle size={RFValue(11)} color="#FFF" style={{ marginRight: wp('1.5%') }} />
                <Text style={styles.confirmPublishBtnText}>{t('addPost.publishNow')}</Text>
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
  /* --- Aspect Ratio Selector Styling --- */
  aspectSection: {
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#FFE0D0',
    padding: wp('3.5%'),
    marginBottom: hp('2.5%'),
  },
  aspectTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: hp('1.2%'),
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp('2.5%'),
  },
  aspectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.9%'),
    borderRadius: wp('5%'),
    borderWidth: 1.2,
    borderColor: '#E7E7E7',
    backgroundColor: '#FFFBF9',
  },
  aspectChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF0E8',
  },
  aspectShape: {
    width: 13,
    height: 13,
    borderRadius: 2,
    marginRight: wp('1.2%'),
    borderWidth: 1.5,
    borderColor: '#B9B9B9',
  },
  aspectShapeActive: {
    borderColor: Colors.primary,
  },
  aspectChipText: {
    fontSize: RFValue(10),
    fontWeight: '600',
    color: Colors.gray,
  },
  aspectChipTextActive: {
    color: Colors.primary,
  },
  croppingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1.2%'),
  },
  croppingText: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    marginLeft: wp('1.5%'),
    fontWeight: '500',
  },
  aspectRequiredText: {
    fontSize: RFValue(10),
    color: Colors.primary,
    marginTop: hp('1.2%'),
    fontWeight: '600',
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

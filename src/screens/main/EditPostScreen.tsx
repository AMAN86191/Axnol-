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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { CustomButton } from '../../components/CustomButton';
import useHomeStore from '../../zustand/useHomeStore';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPostScreen'>;

const EditPostScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<EditPostScreenRouteProp>();
  const { post } = route.params as any;
  const { updatePostStore, deletePostImageStore } = useHomeStore();
  console.log('Edit post', post)
  const [caption, setCaption] = useState(post?.text || '');
  const [images, setImages] = useState<string[]>([]);
  const [rawImages, setRawImages] = useState<any[]>([]); // Instagram-style: crop karne ka base
  const [selectedAspect, setSelectedAspect] = useState<'original' | 'square' | 'portrait' | 'landscape'>('original');
  const [isCropping, setIsCropping] = useState(false);
  const [removedServerImages, setRemovedServerImages] = useState<{ id: string | number; url: string }[]>([]); // Save par hi server se delete hoti hain
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const captionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (post) {
      setCaption(post.text);
      setImages(post.images || (post.image ? [post.image] : []));
    } else {
      Alert.alert(t('common.error'), t('editPost.postNotFound'));
      navigation.goBack();
    }
  }, [post]);

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert(t('addPost.limitReached'), t('addPost.limitMessage'));
      return;
    }

    try {
      const maxCount = 5 - images.length;

      // Step 1: Gallery se multiple images select karo (original, bina crop)
      const picked = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        multiple: true,
        maxFiles: maxCount,
      });

      if (!picked || picked.length === 0) return;

      const selectedRaw = picked.map((img: any) => ({
        uri: img.path,
        type: img.mime || 'image/jpeg',
        fileName: img.filename || img.path.split('/').pop() || 'image.jpg',
        path: img.path,
      }));

      const nextRaw = [...rawImages, ...selectedRaw].slice(0, 5);
      setRawImages(nextRaw);
      setSelectedAspect('original');

      // Original preview mein add karo (server images ke saath)
      setImages(prev => {
        const updated = [...prev, ...selectedRaw.map(img => img.uri)];
        return updated.slice(0, 5);
      });
    } catch (error: any) {
      // User cancelled — koi problem nahi
      if (error?.code !== 'E_PICKER_CANCELLED' && error?.message !== 'User cancelled image selection') {
        console.log('Error selecting images:', error);
        Alert.alert(t('common.error'), t('addPost.selectImageFailed'));
      }
    }
  };

  // Instagram-style: aspect ratio select karne par nayi images us frame mein crop
  const applyAspectRatio = async (aspect: 'original' | 'square' | 'portrait' | 'landscape') => {
    setSelectedAspect(aspect);
    if (rawImages.length === 0) return;

    // Original — koi crop nahi
    if (aspect === 'original') {
      setImages(prev => {
        // raw images ke uris ko original se replace karo (nayi picked)
        const rawUris = new Set(rawImages.map(r => r.uri));
        const others = prev.filter(u => !rawUris.has(u));
        return [...others, ...rawImages.map(r => r.uri)].slice(0, 5);
      });
      return;
    }

    const dims: Record<string, { width: number; height: number }> = {
      square: { width: 1080, height: 1080 },
      portrait: { width: 1080, height: 1350 },   // 4:5
      landscape: { width: 1920, height: 1080 },  // 16:9
    };
    const target = dims[aspect];

    setIsCropping(true);
    try {
      const croppedUris: string[] = [];
      for (let i = 0; i < rawImages.length; i++) {
        const raw = rawImages[i];
        const result = await ImageCropPicker.openCropper({
          path: raw.path,
          mediaType: 'photo',
          width: target.width,
          height: target.height,
          cropperActiveWidgetColor: Colors.primary,
          cropperToolbarColor: '#FFFFFF',
          cropperToolbarTitle: t('addPost.cropTitle', { current: i + 1, total: rawImages.length }),
          cropperStatusBarLight: true,
          cropperTintColor: Colors.primary,
          cropperCancelText: t('addPost.cropCancel'),
          cropperChooseText: t('addPost.cropChoose'),
        });

        if (result?.path) {
          croppedUris.push(result.path);
        }
      }

      if (croppedUris.length > 0) {
        setImages(prev => {
          const rawUris = new Set(rawImages.map(r => r.uri));
          const others = prev.filter(u => !rawUris.has(u));
          return [...others, ...croppedUris].slice(0, 5);
        });
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED' && error?.message !== 'User cancelled image selection') {
        console.log('Crop error:', error);
        Alert.alert(t('common.error'), t('addPost.selectImageFailed'));
      }
    } finally {
      setIsCropping(false);
    }
  };

  const removeImage = (index: number) => {
    const imgToRemove = images[index];
    // Agar ye server image hai, to Save par delete karne ke liye note karo (abhi delete NAHI)
    if (imgToRemove.startsWith('http') && post?.original_post_images) {
      const foundImage = post.original_post_images.find((pi: any) => {
        if (pi.image) return pi.image === imgToRemove;
        if (pi.post_img) return pi.post_img.startsWith('http') ? pi.post_img === imgToRemove : `https://gst.tambimotors.com/${pi.post_img}` === imgToRemove;
        return false;
      });

      if (foundImage) {
        setRemovedServerImages(prev => [...prev, { id: foundImage.id, url: imgToRemove }]);
      }
    }

    setImages(prev => prev.filter((_, i) => i !== index));
    setRawImages(prev => prev.filter(r => r.uri !== imgToRemove));
  };

  if (!post) return null;




  const handleSavePost = async () => {
    if (!caption.trim()) {
      Alert.alert(t('addPost.validationError'), t('editPost.enterCaption'));
      return;
    }

    try {
      setLoading(true);

      // Remove ki gayi server images ko pehle delete karo (sirf Save par)
      for (const item of removedServerImages) {
        await deletePostImageStore(post.id, item.id);
      }

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
      const res = await updatePostStore(formData);
      console.log('edit post res', res)
      Alert.alert(t('common.success'), t('editPost.updatedSuccess'), [
        { text: t('common.ok'), onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Update post error:', error);
      Alert.alert(t('common.error'), t('editPost.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <CommonHeader title={t('editPost.title')} onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

          {/* Photos Header */}
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>{t('addPost.photos')}</Text>
            <Text style={styles.photoSectionSubtitle}>{images.length} / 5</Text>
          </View>

          {/* Swipable Selected Photos List */}
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
                    <Text style={styles.addMoreCardBtnText}>{t('addPost.addMore')}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* Instagram-style Aspect Ratio Selector (nayi images ke liye) */}
          {rawImages.length > 0 && (
            <View style={styles.aspectSection}>
              <Text style={styles.aspectTitle}>{t('addPost.aspectTitle')}</Text>
              <View style={styles.aspectRow}>
                {(
                  [
                    // { key: 'original', label: t('addPost.aspectOriginal') },
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
                        { aspectRatio: opt.key === 'square' ? 1 : opt.key === 'portrait' ? 4 / 5 : opt.key === 'landscape' ? 16 / 9 : 1 },
                        // opt.key === 'original' && { width: 10, height: 10 },
                        selectedAspect === opt.key && styles.aspectShapeActive,
                      ]}
                    />
                    <Text style={[styles.aspectChipText, selectedAspect === opt.key && styles.aspectChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isCropping && (
                <View style={styles.croppingIndicator}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.croppingText}>{t('addPost.cropping')}</Text>
                </View>
              )}
            </View>
          )}

          {/* Caption Box */}
          <View style={styles.captionBox}>
            <TextInput
              ref={captionInputRef}
              style={styles.captionInput}
              placeholder={t('editPost.editCaption')}
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
            title={t('editPost.saveChanges')}
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

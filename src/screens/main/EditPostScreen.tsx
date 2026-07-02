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
  Smile,
  AtSign,
  Hash,
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { CustomButton } from '../../components/CustomButton';
import { usePosts } from '../../context/PostContext';
import { RootStackParamList } from '../../navigation/types';

type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPostScreen'>;

const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditPostScreenRouteProp>();
  const { postId } = route.params;
  const { posts, updatePost } = usePosts();

  const post = posts.find(p => p.id === postId);

  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [activePanel, setActivePanel] = useState<'none' | 'emoji' | 'mention' | 'hashtag'>('none');
  const [emojiCategory, setEmojiCategory] = useState<'smileys' | 'animals' | 'symbols'>('smileys');
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!post) return null;

  const EMOJIS = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
    animals: ['🐮', '🐄', '🐂', '🐾', '🌾', '🌱', '🌿', '☘️', '🍀', '🍂', '🍁', '🌸', '🌼', '🌻', '🌺', '🌹', '🐈', '🐕', '🐎', '🐐', '🐏', '🐑', '🐖', '🐓', '🦆', '🦅', '🕊️', '🦢', '🦉', '🦚', '🦜'],
    symbols: ['🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💗', '💓', '💞', '💕', '✨', '🌟', '⭐', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '❄️', '☃️', '🚩', '🏁', '📍', '📌', '🔔', '📣', '📢', '💬', '💭', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝']
  };

  const SUGGESTED_MENTIONS = [
    '@gaumatatrust',
    '@nandi_sanctuary',
    '@sevak_rahul',
    '@gaushala_feed',
    '@donor_care',
    '@save_cows_initiative',
  ];

  const SUGGESTED_HASHTAGS = [
    '#Gaumata',
    '#GauSeva',
    '#CowSanctuary',
    '#SaveCows',
    '#CalfCare',
  ];

  const insertText = (textToInsert: string) => {
    const start = selection.start;
    const end = selection.end;
    
    const s = start !== undefined ? start : caption.length;
    const e = end !== undefined ? end : caption.length;

    const textBefore = caption.substring(0, s);
    const textAfter = caption.substring(e);
    const newCaption = textBefore + textToInsert + textAfter;

    if (newCaption.length <= 500) {
      setCaption(newCaption);
      const newCursorPos = s + textToInsert.length;
      setSelection({ start: newCursorPos, end: newCursorPos });
    }

    setTimeout(() => {
      captionInputRef.current?.focus();
    }, 50);
  };

  const handleSmilePress = () => {
    setActivePanel(prev => prev === 'emoji' ? 'none' : 'emoji');
  };

  const handleAtPress = () => {
    if (activePanel === 'mention') {
      setActivePanel('none');
    } else {
      setActivePanel('mention');
      const start = selection.start;
      const textBefore = caption.substring(0, start);
      if (!textBefore.endsWith('@')) {
        insertText('@');
      } else {
        setTimeout(() => {
          captionInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const handleHashPress = () => {
    if (activePanel === 'hashtag') {
      setActivePanel('none');
    } else {
      setActivePanel('hashtag');
      const start = selection.start;
      const textBefore = caption.substring(0, start);
      if (!textBefore.endsWith('#')) {
        insertText('#');
      } else {
        setTimeout(() => {
          captionInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const insertMention = (mention: string) => {
    const start = selection.start;
    const textBefore = caption.substring(0, start);
    const endsWithAt = textBefore.endsWith('@');
    
    let textToInsert = mention + ' ';
    let replaceStart = start;

    if (endsWithAt) {
      replaceStart = start - 1;
    }

    const newTextBefore = caption.substring(0, replaceStart);
    const textAfter = caption.substring(selection.end);
    const newCaption = newTextBefore + textToInsert + textAfter;

    if (newCaption.length <= 500) {
      setCaption(newCaption);
      const newCursorPos = replaceStart + textToInsert.length;
      setSelection({ start: newCursorPos, end: newCursorPos });
    }
    
    setTimeout(() => {
      captionInputRef.current?.focus();
    }, 50);
  };

  const insertHashtag = (tag: string) => {
    const start = selection.start;
    const textBefore = caption.substring(0, start);
    const endsWithHash = textBefore.endsWith('#');
    
    let textToInsert = tag + ' ';
    let replaceStart = start;

    if (endsWithHash) {
      replaceStart = start - 1;
    }

    const newTextBefore = caption.substring(0, replaceStart);
    const textAfter = caption.substring(selection.end);
    const newCaption = newTextBefore + textToInsert + textAfter;

    if (newCaption.length <= 500) {
      setCaption(newCaption);
      const newCursorPos = replaceStart + textToInsert.length;
      setSelection({ start: newCursorPos, end: newCursorPos });
    }

    setTimeout(() => {
      captionInputRef.current?.focus();
    }, 50);
  };

  const handleSavePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Validation Error', 'Please enter a caption.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one photo.');
      return;
    }

    try {
      setLoading(true);
      const result = updatePost(postId, caption, images);

      if (result.success) {
        Alert.alert('Success 🎉', 'Post updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Validation Error', result.error || 'Failed to update post.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'An unexpected error occurred.');
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
              <View style={styles.captionIconsRow}>
                <TouchableOpacity
                  style={[styles.captionIconBtn, activePanel === 'emoji' && styles.captionIconBtnActive]}
                  onPress={handleSmilePress}
                  activeOpacity={0.7}
                >
                  <Smile size={20} color={activePanel === 'emoji' ? Colors.primary : Colors.dark} strokeWidth={1.8} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.captionIconBtn, activePanel === 'mention' && styles.captionIconBtnActive]}
                  onPress={handleAtPress}
                  activeOpacity={0.7}
                >
                  <AtSign size={20} color={activePanel === 'mention' ? Colors.primary : Colors.dark} strokeWidth={1.8} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.captionIconBtn, activePanel === 'hashtag' && styles.captionIconBtnActive]}
                  onPress={handleHashPress}
                  activeOpacity={0.7}
                >
                  <Hash size={20} color={activePanel === 'hashtag' ? Colors.primary : Colors.dark} strokeWidth={1.8} />
                </TouchableOpacity>
              </View>
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>

            {activePanel === 'emoji' && (
              <View style={styles.emojiPanel}>
                <View style={styles.emojiTabs}>
                  <TouchableOpacity
                    style={[styles.emojiTab, emojiCategory === 'smileys' && styles.emojiTabActive]}
                    onPress={() => setEmojiCategory('smileys')}
                  >
                    <Text style={[styles.emojiTabText, emojiCategory === 'smileys' && styles.emojiTabTextActive]}>😀 Smileys</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.emojiTab, emojiCategory === 'animals' && styles.emojiTabActive]}
                    onPress={() => setEmojiCategory('animals')}
                  >
                    <Text style={[styles.emojiTabText, emojiCategory === 'animals' && styles.emojiTabTextActive]}>🐮 Animals</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.emojiTab, emojiCategory === 'symbols' && styles.emojiTabActive]}
                    onPress={() => setEmojiCategory('symbols')}
                  >
                    <Text style={[styles.emojiTabText, emojiCategory === 'symbols' && styles.emojiTabTextActive]}>✨ Symbols</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.emojiGrid} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {EMOJIS[emojiCategory].map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.emojiGridCell}
                      onPress={() => insertText(emoji)}
                    >
                      <Text style={styles.emojiGridText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {activePanel === 'mention' && (
              <View style={styles.helperPanel}>
                <Text style={styles.helperPanelTitle}>Suggested Mentions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.helperScroll}>
                  {SUGGESTED_MENTIONS.map((mention, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.mentionChip}
                      onPress={() => insertMention(mention)}
                    >
                      <Text style={styles.mentionChipText}>{mention}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {activePanel === 'hashtag' && (
              <View style={styles.helperPanel}>
                <Text style={styles.helperPanelTitle}>Trending Hashtags</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.helperScroll}>
                  {SUGGESTED_HASHTAGS.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.hashtagChip}
                      onPress={() => insertHashtag(tag)}
                    >
                      <Text style={styles.hashtagChipText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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
    justifyContent: 'space-between',
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

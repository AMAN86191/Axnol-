import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArrowRight,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Lock,
  Map,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react-native';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateProfileSlice, changePasswordSlice} from '../../redux/AuthSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AppImage from '../../components/ui/AppImage';
import {toast} from '../../components/ui/ToastProvider';
import images from '../../assets/images';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import Logo from '../../components/ui/Logo';

type FormState = {
  name: string;
  phone: string;
  company: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatar: string;
  avatarFileName: string;
  avatarMime: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  company: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  avatar: '',
  avatarFileName: '',
  avatarMime: '',
};

const {height: SCREEN_H} = Dimensions.get('window');

type SheetAction = {
  key: string;
  label: string;
  hint: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  danger?: boolean;
  onPress: () => void;
};

type SheetActionRowProps = {
  action: SheetAction;
  index: number;
  visible: boolean;
  onRun: (action: SheetAction) => void;
};

const SheetActionRow: React.FC<SheetActionRowProps> = ({
  action,
  index,
  visible,
  onRun,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withDelay(
        110 + index * 70,
        withTiming(1, {duration: 260}),
      );
    } else {
      progress.value = 0;
    }
  }, [visible, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{translateY: (1 - progress.value) * 16}],
  }));

  const Icon = action.icon;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.sheetOption}
        activeOpacity={0.75}
        onPress={() => onRun(action)}>
        <View style={[styles.sheetOptionIcon, {backgroundColor: action.bg}]}>
          <Icon size={scale(18)} color={action.color} strokeWidth={2.2} />
        </View>
        <View style={styles.sheetOptionTexts}>
          <Text
            style={[
              styles.sheetOptionLabel,
              action.danger && styles.sheetOptionLabelDanger,
            ]}>
            {action.label}
          </Text>
          <Text style={styles.sheetOptionHint}>{action.hint}</Text>
        </View>
        <ChevronRight size={scale(16)} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
};

type PhotoPickerSheetProps = {
  visible: boolean;
  hasPhoto: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove: () => void;
};

const PhotoPickerSheet: React.FC<PhotoPickerSheetProps> = ({
  visible,
  hasPhoto,
  onClose,
  onCamera,
  onGallery,
  onRemove,
}) => {
  const insets = useSafeAreaInsets();
  const backdrop = useSharedValue(0);
  const sheetY = useSharedValue(1);
  const takenRef = useRef(false);

  useEffect(() => {
    if (visible) {
      takenRef.current = false;
      backdrop.value = withTiming(1, {duration: 220});
      sheetY.value = withSpring(0, {
        damping: 18,
        stiffness: 190,
        mass: 0.9,
      });
    }
  }, [visible, backdrop, sheetY]);

  const close = () => {
    backdrop.value = withTiming(0, {duration: 180});
    sheetY.value = withTiming(
      1,
      {duration: 240, easing: Easing.in(Easing.cubic)},
      finished => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  const runAction = (action: SheetAction) => {
    if (takenRef.current) {
      return;
    }
    takenRef.current = true;
    action.onPress();
    close();
  };

  const actions: SheetAction[] = [
    {
      key: 'gallery',
      label: 'Choose from Gallery',
      hint: 'Pick an existing photo from your device',
      icon: ImageIcon,
      color: '#0EA5E9',
      bg: '#F0F9FF',
      onPress: onGallery,
    },
    ...(hasPhoto
      ? [
          {
            key: 'remove',
            label: 'Remove Photo',
            hint: 'Remove current and use default avatar',
            icon: Trash2,
            color: '#EF4444',
            bg: '#FEF2F2',
            danger: true,
            onPress: onRemove,
          } as SheetAction,
        ]
      : []),
  ];

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: sheetY.value * SCREEN_H}],
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}>
      <View style={styles.sheetOverlay}>
        <Animated.View style={[styles.sheetBackdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouch}
            activeOpacity={1}
            onPress={close}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {paddingBottom: insets.bottom + scale(16)},
          ]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Profile Photo</Text>
          <Text style={styles.sheetSubtitle}>
            Choose how you'd like to update your picture
          </Text>

          {actions.map((action, index) => (
            <SheetActionRow
              key={action.key}
              action={action}
              index={index}
              visible={visible}
              onRun={runAction}
            />
          ))}

          <TouchableOpacity
            style={styles.sheetCancel}
            activeOpacity={0.8}
            onPress={close}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(s => s.auth.user);
  const scrollRef = useRef<ScrollView>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const applyUser = (user: any) => {
    if (!user) {
      return;
    }
    const company = user.company;
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      company:
        (typeof company === 'string' ? company : company?.company_name) ?? '',
      gstin:
        user.gst_number ?? user.gstin ?? company?.gst_number ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      pincode: user.pincode ?? '',
      avatar: user.profile_pic_url ?? user.profile_pic ?? user.avatar ?? '',
      avatarFileName: '',
      avatarMime: '',
    });
  };

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('axnol_user')
      .then(raw => {
        if (!active) {
          return;
        }
        if (raw) {
          try {
            applyUser(JSON.parse(raw));
          } catch {
            // ignore malformed cache
          }
        } else {
          applyUser(reduxUser);
        }
      })
      .catch(() => {
        if (active) {
          applyUser(reduxUser);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingProfile(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduxUser) {
      applyUser(reduxUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxUser]);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm(prev => ({...prev, [key]: value}));

  const switchTab = (tab: 'profile' | 'password') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({y: 0, animated: true});
  };

  const openPicker = async (
    launcher: (
      options: CameraOptions & ImageLibraryOptions,
    ) => Promise<ImagePickerResponse>,
  ) => {
    try {
      const result = await launcher({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        toast.error(
          'Image Error',
          result.errorMessage ?? 'Could not open the image picker.',
        );
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setForm(prev => ({
          ...prev,
          avatar: asset.uri as string,
          avatarFileName:
            asset.fileName ?? `profile-${Date.now()}.jpg`,
          avatarMime: asset.type ?? 'image/jpeg',
        }));
      }
    } catch {
      toast.error('Image Error', 'Could not open the image picker.');
    }
  };

  const changePhoto = () => setPhotoSheetVisible(true);

  const removePhoto = () =>
    setForm(prev => ({
      ...prev,
      avatar: '',
      avatarFileName: '',
      avatarMime: '',
    }));

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.warning('Missing Name', 'Please enter your name.');
      return;
    }
    if (!form.phone.trim()) {
      toast.warning('Missing Phone', 'Please enter your phone number.');
      return;
    }
    if (!form.company.trim()) {
      toast.warning('Missing Company', 'Please enter your company name.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('phone', form.phone.trim());
      formData.append('company_name', form.company.trim());
      formData.append('gst_number', form.gstin.trim());
      formData.append('address', form.address.trim());
      formData.append('city', form.city.trim());
      formData.append('state', form.state.trim());
      formData.append('pincode', form.pincode.trim());

      if (form.avatar && !/^https?:\/\//i.test(form.avatar)) {
        formData.append('profile_pic', {
          uri: form.avatar,
          name: form.avatarFileName || `profile-${Date.now()}.jpg`,
          type: form.avatarMime || 'image/jpeg',
        } as any);
      }

      await dispatch(updateProfileSlice(formData)).unwrap();
      setSaving(false);
      toast.success(
        'Profile Updated',
        'Your profile has been updated successfully.',
      );
      navigation.goBack();
    } catch (e: any) {
      setSaving(false);
      toast.error('Update Failed', e?.message ?? 'Please try again later.');
    }
  };

  const setPasswordField =
    (key: keyof typeof passwordForm) => (value: string) =>
      setPasswordForm(prev => ({...prev, [key]: value}));

  const onUpdatePassword = async () => {
    if (!passwordForm.current_password) {
      toast.warning('Current Password', 'Please enter your current password.');
      return;
    }
    if (passwordForm.password.length < 8) {
      toast.warning(
        'Weak Password',
        'New password must be at least 8 characters long.',
      );
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.warning(
        'Password Mismatch',
        'New password and confirmation do not match.',
      );
      return;
    }
    if (passwordForm.password === passwordForm.current_password) {
      toast.warning(
        'Same Password',
        'New password must be different from the current password.',
      );
      return;
    }
    setUpdatingPassword(true);
    try {
      await dispatch(changePasswordSlice(passwordForm)).unwrap();
      setUpdatingPassword(false);
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      toast.success('Password Updated', 'Your password has been changed successfully.');
      navigation.goBack();
    } catch (e: any) {
      setUpdatingPassword(false);
      toast.error(
        'Update Failed',
        e?.message ?? 'Could not update your password. Please try again.',
      );
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Ambient tint blobs so the frosted glass card has light to catch */}
      <View pointerEvents="none" style={styles.blobBlue} />
      <View pointerEvents="none" style={styles.blobSky} />
      <View pointerEvents="none" style={styles.blobBlueTwo} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + scale(60),
              paddingBottom: insets.bottom + scale(40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          {/* Fixed header */}
          <View style={[styles.header, {paddingTop: insets.top + scale(6)}]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}>
              <ChevronLeft size={scale(20)} color="#1E293B" />
            </TouchableOpacity>
            <Logo height={scale(36)} />
            <View style={styles.headerSpacer} />
          </View>

          {/* Top-right corner art */}
          <Image
            source={images.register_corner_bg}
            style={styles.cornerBg}
            resizeMode="contain"
          />

          {/* Title section */}
          <View style={styles.titleSection}>
            <Text style={styles.eyebrow}>ACCOUNT SETTINGS</Text>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Keep your personal and business{'\n'}details up to date.
            </Text>
          </View>

          {/* Section tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'profile' && styles.tabItemActive,
              ]}
              activeOpacity={0.85}
              onPress={() => switchTab('profile')}>
              <User
                size={scale(15)}
                color={activeTab === 'profile' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'profile' && styles.tabLabelActive,
                ]}>
                Profile Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'password' && styles.tabItemActive,
              ]}
              activeOpacity={0.85}
              onPress={() => switchTab('password')}>
              <Lock
                size={scale(15)}
                color={activeTab === 'password' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'password' && styles.tabLabelActive,
                ]}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Frosted glass card */}
          {activeTab === 'profile' ? (
          <View style={styles.mainCard}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.55)',
                'rgba(255,255,255,0.08)',
                'rgba(255,255,255,0)',
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.glassSheen}
            />

            {/* Personal Details */}
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionBadge, styles.badgeBlue]}>
                <User size={scale(19)} color="#0284C7" strokeWidth={2.2} />
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionHeaderTitle}>Personal Details</Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Your basic contact information
                </Text>
              </View>
            </View>

            <View style={styles.avatarPickerWrap}>
              <TouchableOpacity
                style={styles.avatarPicker}
                activeOpacity={0.85}
                onPress={changePhoto}>
                <AppImage
                  uri={form.avatar || 'user_avatar'}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
                <View style={styles.avatarOverlay}>
                  <Camera size={scale(16)} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                activeOpacity={0.7}
                onPress={changePhoto}>
                <Camera size={scale(13)} color="#0284C7" strokeWidth={2.4} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <Input
              variant="clean"
              required
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={setField('name')}
              leftIcon={User}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={form.phone}
              onChangeText={setField('phone')}
              keyboardType="phone-pad"
              leftIcon={Phone}
              containerStyle={styles.fieldSpacing}
            />

            <View style={styles.sectionDivider} />

            {/* Company Details */}
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionBadge, styles.badgeOrange]}>
                <Building2 size={scale(19)} color="#EA580C" strokeWidth={2.2} />
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionHeaderTitle}>Company Details</Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Your organization information
                </Text>
              </View>
            </View>

            <Input
              variant="clean"
              label="Company Name"
              placeholder="Enter company name"
              value={form.company}
              onChangeText={setField('company')}
              leftIcon={Building2}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              label="GST Number"
              placeholder="Enter GST number"
              value={form.gstin}
              onChangeText={setField('gstin')}
              autoCapitalize="characters"
              // leftIcon={Percent}
              containerStyle={styles.fieldSpacing}
            />

            <View style={styles.sectionDivider} />

            {/* Address Details */}
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionBadge, styles.badgeGreen]}>
                <MapPin size={scale(19)} color="#16A34A" strokeWidth={2.2} />
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionHeaderTitle}>Address Details</Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Where you operate from
                </Text>
              </View>
            </View>

            <Input
              variant="clean"
              label="Address"
              placeholder="House no, street, area"
              value={form.address}
              onChangeText={setField('address')}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              leftIcon={MapPin}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              label="City"
              placeholder="Enter city"
              value={form.city}
              onChangeText={setField('city')}
              leftIcon={Building2}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              label="State"
              placeholder="Enter state"
              value={form.state}
              onChangeText={setField('state')}
              leftIcon={Map}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              label="Pincode"
              placeholder="Enter pincode"
              value={form.pincode}
              onChangeText={setField('pincode')}
              keyboardType="number-pad"
              // leftIcon={Hash}
              containerStyle={styles.fieldSpacing}
            />

            <Button
              title="Save Changes"
              variant="outline"
              size="medium"
              onPress={onSave}
              loading={saving}
              iconRight={
                <ArrowRight
                  size={scale(18)}
                  color={colors.primary}
                  strokeWidth={2.2}
                />
              }
              textStyle={styles.saveBtnText}
            />

            <View style={styles.secureRow}>
              <ShieldCheck size={scale(14)} color="#16A34A" />
              <Text style={styles.secureText}>
                Your details are safe and secure
              </Text>
            </View>
          </View>
          ) : (
          <View style={styles.mainCard}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.55)',
                'rgba(255,255,255,0.08)',
                'rgba(255,255,255,0)',
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.glassSheen}
            />

            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionBadge, styles.badgePurple]}>
                <Lock size={scale(19)} color="#7C3AED" strokeWidth={2.2} />
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionHeaderTitle}>Account Security</Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Update your login password
                </Text>
              </View>
            </View>

            <Input
              variant="clean"
              required
              label="Current Password"
              placeholder="Enter current password"
              value={passwordForm.current_password}
              onChangeText={setPasswordField('current_password')}
              secureTextEntry
              leftIcon={Lock}
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              required
              label="New Password"
              placeholder="Enter new password"
              value={passwordForm.password}
              onChangeText={setPasswordField('password')}
              secureTextEntry
              leftIcon={Lock}
              helperText="Use at least 8 characters"
              containerStyle={styles.fieldSpacing}
            />

            <Input
              variant="clean"
              required
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={passwordForm.password_confirmation}
              onChangeText={setPasswordField('password_confirmation')}
              secureTextEntry
              leftIcon={ShieldCheck}
              containerStyle={styles.fieldSpacing}
            />

            <Button
              title="Update Password"
              variant="outline"
              size="medium"
              onPress={onUpdatePassword}
              loading={updatingPassword}
              iconRight={
                <Lock
                  size={scale(17)}
                  color={colors.primary}
                  strokeWidth={2.2}
                />
              }
              textStyle={styles.saveBtnText}
            />

            <View style={styles.secureRow}>
              <ShieldCheck size={scale(14)} color="#16A34A" />
              <Text style={styles.secureText}>
                Choose a strong, unique password
              </Text>
            </View>
          </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <PhotoPickerSheet
        visible={photoSheetVisible}
        hasPhoto={!!form.avatar}
        onClose={() => setPhotoSheetVisible(false)}
        onCamera={() => openPicker(launchCamera)}
        onGallery={() => openPicker(launchImageLibrary)}
        onRemove={removePhoto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },

  /* Ambient blobs */
  blobBlue: {
    position: 'absolute',
    top: scale(120),
    left: -scale(80),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: 'rgba(2,132,199,0.10)',
  },
  blobSky: {
    position: 'absolute',
    top: scale(360),
    right: -scale(70),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(57,184,253,0.10)',
  },
  blobBlueTwo: {
    position: 'absolute',
    bottom: scale(40),
    left: -scale(60),
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(2,132,199,0.08)',
  },

  /* Fixed header */
  cornerBg: {
    position: 'absolute',
    top: 0,
    right: -spacing.lg,
    width: scale(210),
    height: scale(200),
    zIndex: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  backBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerSpacer: {
    width: scale(34),
  },

  /* Title */
  titleSection: {
    marginTop: scale(10),
    marginBottom: scale(16),
  },
  eyebrow: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1.5,
    marginBottom: scale(4),
  },
  title: {
    fontSize: scale(25),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: scale(4),
  },
  subtitle: {
    fontSize: scale(13),
    color: '#64748B',
    lineHeight: scale(18.5),
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radius.pill,
    padding: scale(4),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.6)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(9),
    borderRadius: radius.pill,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },

  /* Frosted glass card */
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.xl,
    paddingVertical: scale(15),
    paddingHorizontal: scale(10),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.5)',
    marginBottom: scale(20),
    overflow: 'hidden',
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
    gap: scale(10),
  },
  sectionBadge: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  badgeOrange: {
    backgroundColor: '#FFF7ED',
  },
  badgeGreen: {
    backgroundColor: '#F0FDF4',
  },
  badgePurple: {
    backgroundColor: '#F5F3FF',
  },
  sectionHeaderTexts: {
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionHeaderSubtitle: {
    fontSize: scale(11.5),
    color: '#64748B',
    marginTop: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(203,213,225,0.5)',
    marginVertical: scale(16),
  },
  fieldSpacing: {
    marginBottom: scale(14),
  },
  avatarPickerWrap: {
    alignItems: 'center',
    marginBottom: scale(18),
  },
  avatarPicker: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(28),
    backgroundColor: 'rgba(2,132,199,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginTop: scale(9),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    backgroundColor: '#EFF6FF',
  },
  changePhotoText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.1,
  },
  saveBtnText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    marginTop: scale(16),
  },
  secureText: {
    fontSize: fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Photo picker bottom sheet */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: scale(10),
    paddingHorizontal: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: '#E2E8F0',
    marginBottom: scale(14),
  },
  sheetTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: scale(12),
    color: '#64748B',
    marginTop: 3,
    marginBottom: scale(14),
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    paddingHorizontal: scale(12),
    paddingVertical: scale(11),
    marginBottom: scale(9),
  },
  sheetOptionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionTexts: {
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetOptionLabelDanger: {
    color: '#EF4444',
  },
  sheetOptionHint: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: 1,
  },
  sheetCancel: {
    height: scale(46),
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(4),
  },
  sheetCancelText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#475569',
  },
});

export default EditProfileScreen;

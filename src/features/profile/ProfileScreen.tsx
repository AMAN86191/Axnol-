import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Building2,
  ChevronRight,
  HelpCircle,
  LogOut,
  Mail,
  Pencil,
  Phone,
  ScrollText,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {clearAuth, deleteAccountSlice} from '../../redux/AuthSlice';
import {invalidateRequests} from '../../api/requestCache';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {toast} from '../../components/ui/ToastProvider';
import {ConfirmModal} from '../../components/ui/ConfirmModal';
import images from '../../assets/images';
import {colors, radius, scale, shadows, spacing} from '../../theme';


interface MenuItem {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
}

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
  showDot?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  isLast,
  showDot,
}) => (
  <View style={[styles.infoRow, !isLast && styles.rowDivider]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueWrap}>
      {showDot ? <View style={styles.statusDot} /> : null}
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const reduxUser = useAppSelector(s => s.auth.user);
  const [storedUser, setStoredUser] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [pendingAction, setPendingAction] = useState<'logout' | 'delete' | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('axnol_user')
      .then(raw => {
        if (!active || !raw) return;
        try {
          setStoredUser(JSON.parse(raw));
        } catch {
          // ignore malformed cache
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [reduxUser]);

  const user = storedUser ?? reduxUser;

  const closeConfirm = () => {
    if (!deleting) {
      setPendingAction(null);
    }
  };

  const confirmLogout = async () => {
    setPendingAction(null);
    await AsyncStorage.clear();
    invalidateRequests();
    dispatch(clearAuth());
    toast.success('Logged Out', 'You have been logged out successfully.');
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteAccountSlice()).unwrap();
      setPendingAction(null);
      toast.success(
        'Account Deleted',
        'Your account has been deleted successfully.',
      );
    } catch (error: any) {
      toast.error(
        'Delete Failed',
        error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  };

  const MENU_ITEMS: MenuItem[] = [
    {
      title: 'Help & Support',
      subtitle: 'Get in touch with our team',
      icon: HelpCircle,
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      title: 'Terms & Conditions',
      subtitle: 'Terms of use & service',
      icon: ScrollText,
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: ShieldCheck,
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
  ];

  const company = user?.company;
  const name = user?.name || '—';
  const companyName =
    (typeof company === 'string' ? company : company?.company_name) || '—';
  const email = user?.email || '—';
  const rawPhone = user?.phone || '';
  const phone = rawPhone
    ? /^\d{10}$/.test(rawPhone)
      ? `+91 ${rawPhone}`
      : rawPhone
    : '—';
  const gstNumber =
    user?.gst_number || user?.gstin || company?.gst_number || '—';
  const cityState = [user?.city, user?.state].filter(Boolean).join(', ');
  const location = [cityState, user?.pincode].filter(Boolean).join(' - ') || '—';
  const avatarUri =
    user?.profile_pic_url || user?.profile_pic || user?.avatar || 'user_avatar';

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Ambient tint blobs so the frosted glass cards have light to catch */}
      <View pointerEvents="none" style={styles.blobBlue} />
      <View pointerEvents="none" style={styles.blobSky} />
      <View pointerEvents="none" style={styles.blobBlueTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + scale(14),
          paddingBottom: insets.bottom,
        }}>
        {/* Top-right corner art */}
        <Image
          source={images.register_corner_bg}
          style={styles.cornerBg}
          resizeMode="contain"
        />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={styles.eyebrow}>MY ACCOUNT</Text>
            <Text style={styles.title}>My Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.topEditBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}>
            <Pencil size={scale(12)} color={colors.textInverse} strokeWidth={2.6} />
            <Text style={styles.topEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile hero card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.85)',
              'rgba(255,255,255,0.25)',
              'rgba(255,255,255,0)',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.glassSheen}
          />

          <View style={styles.avatarBlock}>
            <View style={styles.avatarRing}>
              <Image
                source={avatarUri ? {uri: avatarUri} : require('../../../assets/axnol/default_avatar.webp')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
        
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {companyName}
            </Text>

            <View style={styles.contactRow}>
              <Mail size={scale(13)} color="#64748B" strokeWidth={2.2} />
              <Text style={styles.contactText} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={scale(13)} color="#64748B" strokeWidth={2.2} />
              <Text style={styles.contactText} numberOfLines={1}>
                {phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionBadge, styles.badgeBlue]}>
              <Building2 size={scale(19)} color="#0284C7" strokeWidth={2.2} />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionHeaderTitle}>Business Information</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Your registered business details
              </Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <InfoRow label="Company Name" value={companyName} />
          <InfoRow label="GSTIN" value={gstNumber} />
          <InfoRow label="Address" value={user?.address || '—'} />
          <InfoRow label="City & State" value={location} />
          {/* <InfoRow
            label="Account Status"
            value={statusLabel}
            showDot={status === 'active'}
            isLast
          /> */}
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionCard}>

          {MENU_ITEMS.map((item, index) => {
            const isLast = index === MENU_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.menuRow, !isLast && styles.rowDivider]}
                activeOpacity={0.7}
                onPress={item.onPress}>
                <View style={styles.menuIconWrap}>
                  <item.icon
                    size={scale(18)}
                    color="#0284C7"
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight
                  size={scale(17)}
                  color="#94A3B8"
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={() => setPendingAction('logout')}>
          <LogOut size={scale(16)} color={colors.danger} strokeWidth={2.4} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          activeOpacity={0.85}
          onPress={() => setPendingAction('delete')}>
          <Trash2 size={scale(16)} color={colors.danger} strokeWidth={2.4} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={pendingAction === 'logout'}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        onCancel={closeConfirm}
        onConfirm={confirmLogout}
      />

      <ConfirmModal
        visible={pendingAction === 'delete'}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete Account"
        destructive
        loading={deleting}
        onCancel={closeConfirm}
        onConfirm={confirmDeleteAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Ambient blobs */
  blobBlue: {
    position: 'absolute',
    top: scale(90),
    left: -scale(90),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: 'rgba(2,132,199,0.10)',
  },
  blobSky: {
    position: 'absolute',
    top: scale(340),
    right: -scale(80),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    backgroundColor: 'rgba(57,184,253,0.10)',
  },
  blobBlueTwo: {
    position: 'absolute',
    bottom: scale(60),
    left: -scale(70),
    width: scale(210),
    height: scale(210),
    borderRadius: scale(105),
    backgroundColor: 'rgba(2,132,199,0.07)',
  },
  cornerBg: {
    position: 'absolute',
    top: 0,
    right: -scale(13),
    width: scale(210),
    height: scale(200),
    zIndex: 0,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: scale(16),
   
  },
  headerTexts: {
    flex: 1,
  },
  eyebrow: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1.5,
    marginBottom: scale(3),
  },
  title: {
    fontSize: scale(23),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },

  /* Profile hero card */
  profileCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radius.xxl,
    paddingVertical: scale(22),
    paddingHorizontal: scale(18),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.6)',
    marginBottom: scale(18),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    // ...shadows.small,
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  avatarBlock: {
    marginRight: scale(16),
  },
  avatarRing: {
    width: scale(76),
    height: scale(76),
    borderRadius: scale(38),
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    ...shadows.small,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: scale(0),
    right: scale(0),
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    flexShrink: 1,
    fontSize: scale(17),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  company: {
    fontSize: scale(12.5),
    fontWeight: '600',
    color: '#475569',
    marginTop: scale(3),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginTop: scale(5),
  },
  contactText: {
    fontSize: scale(11.5),
    fontWeight: '500',
    color: '#64748B',
  },
  topEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    opacity:0.9,
    ...shadows.small,
  },
  topEditText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.2,
  },

  /* Section cards */
  sectionCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radius.xl,
    paddingVertical: scale(5),
    paddingHorizontal: scale(13),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.5)',
    marginBottom: scale(16),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sectionHeaderTexts: {
    flex: 1,
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
    marginTop: scale(14),
    marginBottom: scale(4),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.8)',
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: scale(13),
  },
  infoLabel: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#64748B',
  },
  infoValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scale(6),
    flex: 1,
  },
  statusDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: '#16A34A',
  },
  infoValue: {
    flexShrink: 1,
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  /* Menu rows */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(10),
  },
  menuIconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(13),
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: scale(2),
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    height: scale(40),
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: scale(13.5),
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.2,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    height: scale(40),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'transparent',
  },
  deleteText: {
    fontSize: scale(13.5),
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.2,
  },
});

export default ProfileScreen;

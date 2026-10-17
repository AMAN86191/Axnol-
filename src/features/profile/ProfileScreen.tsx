import React from 'react';
import {
  Alert,
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
import {useDispatch} from 'react-redux';
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  HelpCircle,
  Info,
  LifeBuoy,
  LogOut,
  Mail,
  Pencil,
  Phone,
  ScrollText,
  ShieldCheck,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLogoutMutation} from '../../api/services/authApi';
import {logout} from '../auth/authSlice';
import {useAppSelector} from '../../store';
import AppImage from '../../components/ui/AppImage';
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
  const {user} = useAppSelector(s => s.auth);
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();

  const doLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutApi().unwrap();
          } catch {
            // ignore
          }
          await AsyncStorage.clear();
          dispatch(logout());
        },
      },
    ]);
  };

  const MENU_ITEMS: MenuItem[] = [
    {
      title: 'Help & Support',
      subtitle: 'Get in touch with our team',
      icon: HelpCircle,
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      title: 'About Us',
      subtitle: 'Learn about Axnol Lubetech',
      icon: Info,
      onPress: () => navigation.navigate('About'),
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

  const name = user?.name ?? 'Rahul Sharma';
  const companyName = user?.company ?? 'Sharma Auto Traders';
  const email = user?.email ?? 'rahul@sharmaauto.in';
  const phone = user?.phone ?? '+91 98290 12345';
  const location = `${user?.city ?? 'Jaipur'}, ${user?.state ?? 'Rajasthan'}`;

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
          paddingBottom: insets.bottom + scale(96),
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
            <Pencil size={scale(14)} color={colors.textInverse} strokeWidth={2.6} />
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
              <AppImage
                uri={user?.avatar ?? 'user_avatar'}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.avatarBadge}>
              <BadgeCheck size={scale(14)} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <BadgeCheck size={scale(16)} color="#0284C7" strokeWidth={2.4} />
          </View>
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

          <InfoRow label="GSTIN" value={user?.gstin ?? '08AABCS1429B1Z6'} />
          <InfoRow
            label="Business Address"
            value={user?.address ?? 'Plot 12, Industrial Area Phase II'}
          />
          <InfoRow label="City & State" value={location} />
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionBadge, styles.badgeOrange]}>
              <LifeBuoy size={scale(19)} color="#EA580C" strokeWidth={2.2} />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionHeaderTitle}>Support &amp; Legal</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Help, policies and more
              </Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />

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
          onPress={doLogout}>
          <LogOut size={scale(16)} color={colors.danger} strokeWidth={2.4} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    // ...shadows.small,
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  avatarBlock: {
    marginBottom: scale(12),
  },
  avatarRing: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
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
    bottom: scale(2),
    right: scale(2),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  name: {
    flexShrink: 1,
    fontSize: scale(18),
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
    gap: scale(6),
    paddingHorizontal: scale(14),
    paddingVertical: scale(9),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  topEditText: {
    fontSize: scale(12.5),
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.2,
  },

  /* Section cards */
  sectionCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radius.xl,
    paddingVertical: scale(15),
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
    paddingVertical: scale(11),
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
    height: scale(50),
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
});

export default ProfileScreen;

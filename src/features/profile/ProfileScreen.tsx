import React from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {
  Bell,
  Building2,
  ChevronRight,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLogoutMutation} from '../../api/services/authApi';
import {logout} from '../auth/authSlice';
import {useAppSelector} from '../../store';
import AppImage from '../../components/ui/AppImage';
import {radius, scale, spacing} from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';

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

  const MENU_ITEMS = [
    {
      title: 'Company Details',
      icon: Building2,
      onPress: () =>
        Alert.alert(
          'Company Details',
          `${user?.company ?? 'Sharma Auto Traders'}\nGSTIN: 08AABCS1429B1Z6\nStatus: Verified Axnol Partner`,
        ),
    },
    {
      title: 'My Address',
      icon: MapPin,
      onPress: () =>
        Alert.alert(
          'My Address',
          `${user?.address ?? 'Plot 12, Industrial Area Phase II'}\n${user?.city ?? 'Jaipur'}, ${user?.state ?? 'Rajasthan'} - ${user?.pincode ?? '302013'}`,
        ),
    },
    {
      title: 'Change Password',
      icon: Lock,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Notification Settings',
      icon: Bell,
      onPress: () => Alert.alert('Notifications', 'Push & SMS order updates are active.'),
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      title: 'About Us',
      icon: Info,
      onPress: () =>
        Alert.alert(
          'About Axnol Lubetech',
          'Axnol Lubetech India Pvt. Ltd.\nSolution of energy since 1959.\nHigh-performance lubricants & specialty greases.',
        ),
    },
  ];

  const company = {
    name: user?.company ?? 'Sharma Auto Traders',
    gstin: '08AABCS1429B1Z6',
    status: 'Verified Axnol Partner',
    address: user?.address ?? 'Plot 12, Industrial Area Phase II',
    location: `${user?.city ?? 'Jaipur'}, ${user?.state ?? 'Rajasthan'} - ${user?.pincode ?? '302013'}`,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="My Profile"
        right={
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}>
            <Settings size={scale(19)} color="#0F172A" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + scale(85)},
        ]}>
        
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <AppImage uri="user_avatar" style={styles.avatar} resizeMode="cover" />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user?.name ?? 'Rahul Sharma'}</Text>
              <ShieldCheck size={scale(15)} color="#1264A3" />
            </View>
            <Text style={styles.userCompany}>
              {user?.company ?? 'Sharma Auto Traders'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email ?? 'rahul@sharmaauto.in'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('EditProfile')}>
            <Pencil size={scale(12)} color="#1264A3" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Company Details Card */}
        <View style={styles.companyCard}>
          <View style={styles.companyHeader}>
            <View style={styles.companyIconWrap}>
              <Building2 size={scale(20)} color="#0284C7" strokeWidth={2} />
            </View>
            <View style={styles.companyHeaderText}>
              <Text style={styles.companyName} numberOfLines={1}>
                {company.name}
              </Text>
              <View style={styles.verifiedRow}>
                <ShieldCheck size={scale(13)} color="#0284C7" />
                <Text style={styles.verifiedText}>{company.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.companyDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GSTIN</Text>
            <Text style={styles.detailValue}>{company.gstin}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Business Address</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {company.address}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>City & State</Text>
            <Text style={styles.detailValue}>{company.location}</Text>
          </View>
        </View>

        {/* Menu Options Group */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => {
            const isLast = index === MENU_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.menuRow, !isLast && styles.menuRowBorder]}
                activeOpacity={0.7}
                onPress={item.onPress}>
                <View style={styles.menuIconWrap}>
                  <item.icon size={scale(19)} color="#1264A3" strokeWidth={2} />
                </View>

                <Text style={styles.menuTitle}>{item.title}</Text>

                <ChevronRight size={scale(17)} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={doLogout}>
          <LogOut size={scale(18)} color="#EF4444" strokeWidth={2.2} />
          <Text style={styles.logoutText}>Logout</Text>
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
  settingsBtn: {
    padding: scale(4),
  },
  scrollContent: {
    padding: spacing.lg,
    gap: scale(14),
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarWrap: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0284C7',
    backgroundColor: '#F1F5F9',
    marginRight: scale(12),
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  userCompany: {
    fontSize: scale(11.5),
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 3,
  },
  editText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#0284C7',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: scale(15),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIconWrap: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(11),
  },
  companyHeaderText: {
    flex: 1,
  },
  companyName: {
    fontSize: scale(14.5),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginTop: scale(2),
  },
  verifiedText: {
    fontSize: scale(11),
    color: '#0284C7',
    fontWeight: '600',
  },
  companyDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(13),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: scale(12),
    marginBottom: scale(11),
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: scale(12),
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: scale(12.5),
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'right',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: scale(14),
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconWrap: {
    width: scale(30),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: scale(13.5),
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(47),
    backgroundColor: '#FEE2E2',
    borderRadius: radius.pill,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  logoutText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#EF4444',
  },
});

export default ProfileScreen;

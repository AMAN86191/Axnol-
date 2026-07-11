import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  Home,
  User,
  Award,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  CreditCard,
  History,
  Share2,
  Image as ImageIcon,
  Phone,
  Info,
  Shield,
  FileCheck,
  Edit3,
  Bell,
  List,
} from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainTabNavigator from './MainTabNavigator';
import { Colors } from '../theme/colors';
import Svg, { Path } from 'react-native-svg';
import useAuthStore from '../zustand/useAuthStore';

const Drawer = createDrawerNavigator();

const WhatsAppIcon = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      fill={color}
    />
  </Svg>
);

// Custom Drawer Sidebar Component
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();
  const { state, navigation } = props;
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from Gaushala Community?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            navigation.closeDrawer();
            const res = await logout();
            console.log(' logout res', res)
            // Reset to Login
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ]
    );
  };



  const joinWhatsApp = () => {
    Linking.openURL('https://chat.whatsapp.com/GaumataTrustCommunityPlaceholder').catch(() => {
      Alert.alert('WhatsApp Community', 'Please join our WhatsApp group via chat link: chat.whatsapp.com/gaumata-sewa-trust');
    });
  };
  // Custom Drawer Item
  const renderDrawerItem = (
    label: string,
    icon: React.ComponentType<any>,
    targetScreen?: string,
    tabName?: string,
    onPressAction?: () => void
  ) => {
    let isActive = false;
    if (targetScreen === 'MainTabs' && tabName) {
      // Find nested tab state if available
      const tabState = state.routes[state.index]?.state;
      if (tabState) {
        const activeTabRoute = tabState.routes?.[tabState.index ?? 0]?.name;
        isActive = activeTabRoute === tabName;
      } else {
        // Default to true for Home tab if first screen
        isActive = tabName === 'Home' && state.index === 0;
      }
    } else if (targetScreen) {
      const activeRouteName = state.routes[state.index]?.name;
      isActive = activeRouteName === targetScreen;
    }

    const IconComponent = icon;

    const handlePress = () => {
      navigation.closeDrawer();
      if (onPressAction) {
        onPressAction();
      } else if (targetScreen === 'MainTabs' && tabName) {
        navigation.navigate('MainTabs', { screen: tabName });
      } else if (targetScreen) {
        navigation.navigate(targetScreen);
      }
    };

    return (
      <TouchableOpacity
        key={label}
        style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.drawerItemLeft}>
          <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
            <IconComponent size={RFValue(13)} color={isActive ? Colors.white : Colors.gray} />
          </View>
          <Text style={[styles.drawerItemLabel, isActive && styles.activeDrawerItemLabel]}>
            {label}
          </Text>
        </View>
        <ChevronRight size={RFValue(12)} color={isActive ? Colors.primary : '#CCCCCC'} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Drawer Header with Close button & Profile information */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + hp('1.5%') }]}>
        {/* Top bar with Close button */}
        <View style={styles.headerTopBar}>
          <Text style={styles.appName}>Gaumata Sewa Trust</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.closeDrawer()}
            activeOpacity={0.7}
          >
            <X size={RFValue(14)} color={Colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Profile User Info Row */}
        <View style={styles.userInfoRow}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.profile?.profile_pic ? `https://gst.tambimotors.com/${user.profile.profile_pic}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150' }} 
              style={styles.profileAvatar} 
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <TouchableOpacity
              style={styles.editProfileCta}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }}
              activeOpacity={0.7}
            >
              <Edit3 size={RFValue(9)} color={Colors.primary} style={{ marginRight: wp('1%') }} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges and Membership Details Card */}
        <View style={styles.membershipDetailsCard}>
          <View style={styles.statusBadgesRow}>
            <View style={styles.statusBadgeGreen}>
              <ShieldCheck size={RFValue(8.5)} color="#10B981" />
              <Text style={styles.statusBadgeTextGreen}>Profile Verified</Text>
            </View>
            <View style={styles.statusBadgeOrange}>
              <Award size={RFValue(8.5)} color="#FF6F34" />
              <Text style={styles.statusBadgeTextOrange}>Become a Member</Text>
            </View>
          </View>
          <View style={styles.memberMetaRow}>
            <Text style={styles.memberMetaText}>ID: {user?.uid || 'N/A'}</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.memberMetaText}>Since: {user?.profile?.join_date ? new Date(user.profile.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Drawer Items Container */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ❤️ Make Donation prominent button */}
        {/* <View style={styles.donationButtonWrapper}>
          <TouchableOpacity
            style={styles.makeDonationBtn}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('MainTabs', { screen: 'Donate' });
            }}
            activeOpacity={0.9}
          >
            <Heart size={RFValue(12)} color="#FFF" fill="#FFF" style={{ marginRight: wp('2%') }} />
            <Text style={styles.makeDonationBtnText}>Make Donation</Text>
          </TouchableOpacity>
        </View> */}
        {/* Sponsor a Cow banner card */}
        <TouchableOpacity
          style={styles.sponsorCard}
          activeOpacity={0.9}
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate('MainTabs', { screen: 'Donate' });
          }}
        >
          <View style={styles.sponsorCardContent}>
            <View style={styles.sponsorEmojiContainer}>
              <Text style={styles.sponsorEmoji}>🐄</Text>
            </View>
            <View style={styles.sponsorTextContainer}>
              <Text style={styles.sponsorTitle}>Sponsor a Cow</Text>
              <Text style={styles.sponsorSubtitle}>Provide food & shelter for a Gau Mata</Text>
            </View>
          </View>
          <View style={styles.sponsorActionBtn}>
            <Text style={styles.sponsorActionText}>Donate Now</Text>
            <ChevronRight size={RFValue(10)} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NAVIGATION</Text>
        </View>

        {renderDrawerItem('Home', Home, 'MainTabs', 'Home')}
        {renderDrawerItem('My Profile', User, 'MainTabs', 'Profile')}
        {renderDrawerItem('My Posts', Edit3, 'MainTabs', 'Profile')}
        {renderDrawerItem('Notifications', Bell, 'NotificationScreen')}
        {renderDrawerItem('Become a Member', CreditCard, 'MainTabs', 'Membership')}





        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MEMBERSHIP & CONTRIBUTIONS</Text>
        </View>

        {renderDrawerItem('Membership Certificate', Award, 'MembershipCertificateScreen')}
        {renderDrawerItem('Donation History', History, 'MainTabs', 'Profile')}
        {renderDrawerItem('Membership ', List, 'PlansScreen')}
        {renderDrawerItem('Referral Friends', Share2, 'ReferralScreen')}
        {renderDrawerItem('WhatsApp Community', WhatsAppIcon, undefined, undefined, joinWhatsApp)}

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ABOUT & GALLERY</Text>
        </View>

        {renderDrawerItem('Gallery', ImageIcon, 'GalleryScreen')}
        {renderDrawerItem('Contact Us', Phone, 'HelpSupportScreen')}
        {renderDrawerItem('About Trust', Info, 'AboutTrustScreen')}

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
        </View>

        {renderDrawerItem('Privacy Policy', Shield, 'PrivacyPolicyScreen')}
        {renderDrawerItem('Terms & Conditions', FileCheck, 'TermsScreen')}

        <View style={styles.divider} />
        {renderDrawerItem('Logout', LogOut, undefined, undefined, handleLogout)}
      </DrawerContentScrollView>
    </View>
  );
};

export default function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(20, 24, 24, 0.6)',
        drawerStyle: {
          width: wp('78%'),
          backgroundColor: Colors.white,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  profileHeader: {
    backgroundColor: '#FFF8F5', // Soft orange tint
    paddingHorizontal: wp('4.5%'),
    paddingBottom: hp('1.8%'),
    // borderBottomWidth: 1,
    // borderBottomColor: '#FFE7DB',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  closeBtn: {
    padding: wp('1%'),
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: wp('3.5%'),
  },
  profileAvatar: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    borderWidth: 1.5,
    borderColor: '#FFD1BD',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp('3.5%'),
    height: wp('3.5%'),
    borderRadius: wp('1.75%'),
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#FFF8F5',
  },
  profileInfo: {
    flex: 1,
  },
  appName: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: Colors.dark,
  },
  editProfileCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.3%'),
  },
  editProfileText: {
    fontSize: RFValue(9),
    color: Colors.primary,
    fontWeight: '700',
  },
  membershipDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    // borderWidth: 1,
    // borderColor: '#FFEBE0',
    marginTop: hp('0.2%'),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: wp('1.8%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('1%'),
    marginRight: wp('1.5%'),
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  statusBadgeOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: wp('1.8%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('1%'),
    borderWidth: 0.5,
    borderColor: '#FFE0D0',
  },
  statusBadgeTextGreen: {
    color: '#065F46',
    fontSize: RFValue(7.8),
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  statusBadgeTextOrange: {
    color: '#FF6F34',
    fontSize: RFValue(7.8),
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp('0.5%'),
  },
  memberMetaText: {
    fontSize: RFValue(8),
    fontWeight: '700',
    color: Colors.gray,
  },
  metaDivider: {
    width: 1,
    height: hp('1.2%'),
    backgroundColor: '#FFE5DA',
    marginHorizontal: wp('2%'),
  },
  donationButtonWrapper: {
    marginBottom: hp('1.5%'),
    marginTop: hp('0.5%'),
  },
  makeDonationBtn: {
    backgroundColor: Colors.primary,
    borderRadius: wp('3.5%'),
    height: hp('4.8%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  makeDonationBtnText: {
    color: Colors.white,
    fontSize: RFValue(11.5),
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('4%'),
  },
  sectionHeader: {
    marginBottom: hp('0.6%'),
    marginTop: hp('0.8%'),
    paddingLeft: wp('1%'),
  },
  sectionTitle: {
    fontSize: RFValue(8.2),
    fontWeight: '700',
    color: Colors.gray,
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2.5%'),
    borderRadius: wp('2.5%'),
    marginBottom: hp('0.6%'),
  },
  activeDrawerItem: {
    backgroundColor: 'rgba(255, 111, 52, 0.08)', // Subtle light primary background
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: wp('7.5%'),
    height: wp('7.5%'),
    borderRadius: wp('1.8%'),
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  activeIconContainer: {
    backgroundColor: Colors.primary,
  },
  drawerItemLabel: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.dark,
  },
  activeDrawerItemLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: hp('0.8%'),
  },
  sponsorCard: {
    backgroundColor: '#FFF1EB', // Soft primary tint
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginVertical: hp('1%'),
    // borderWidth: 1,
    // borderColor: '#FFE0D3',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sponsorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
  },
  sponsorEmojiContainer: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    backgroundColor: '#FFE5DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  sponsorEmoji: {
    fontSize: RFValue(14),
  },
  sponsorTextContainer: {
    flex: 1,
  },
  sponsorTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: Colors.dark,
  },
  sponsorSubtitle: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    marginTop: hp('0.2%'),
  },
  sponsorActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: wp('2%'),
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorActionText: {
    color: Colors.white,
    fontSize: RFValue(10.5),
    fontWeight: '700',
    marginRight: wp('1.5%'),
  },
});

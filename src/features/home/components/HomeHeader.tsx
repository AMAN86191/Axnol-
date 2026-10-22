import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {Bell, Heart, Menu, ShoppingCart} from 'lucide-react-native';
import {colors, scale} from '../../../theme';
import Logo from '../../../components/ui/Logo';

interface HomeHeaderProps {
  userName?: string;
  onBellPress: () => void;
  onProfilePress: () => void;
  onCartPress?: () => void;
  cartCount?: number;
  onWishlistPress?: () => void;
  wishlistCount?: number;
  hasUnreadNotifications?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName: _userName = 'Rahul Sharma',
  onBellPress,
  onProfilePress: _onProfilePress,
  onCartPress,
  cartCount = 0,
  onWishlistPress,
  wishlistCount = 0,
  hasUnreadNotifications = false,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View>
      {/* Top row: sidebar + logo + bell + profile */}
      <View style={styles.headerRow}>
        <View style={styles.leftGroup}>
          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.7}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu size={scale(22)} color="#1E293B" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <Logo height={scale(36)} />
          </View>
        </View>

        <View style={styles.headerRight}>
          {onWishlistPress ? (
            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.75}
              onPress={onWishlistPress}>
              <Heart size={scale(20)} color="#1E293B" strokeWidth={2.2} />
              {wishlistCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}

          {onCartPress ? (
            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.75}
              onPress={onCartPress}>
              <ShoppingCart size={scale(20)} color="#1E293B" strokeWidth={2.2} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.75}
            onPress={onBellPress}>
            <Bell size={scale(20)} color="#1E293B" strokeWidth={2.2} />
            {hasUnreadNotifications ? <View style={styles.bellDot} /> : null}
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.profileChip}
            activeOpacity={0.8}
            onPress={onProfilePress}>
            <AppImage uri="user_avatar" style={styles.avatarImg} />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(6),
    marginBottom: scale(8),
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },
  menuBtn: {
   
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  bellBtn: {
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: scale(5),
    right: scale(7),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadge: {
    position: 'absolute',
    top: scale(2),
    right: scale(2),
    minWidth: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    paddingHorizontal: scale(3),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: scale(9),
    fontWeight: '800',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  avatarImg: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F1F5F9',
  },
});

export default HomeHeader;

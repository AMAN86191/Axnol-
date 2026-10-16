import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {Bell, Menu} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import {scale} from '../../../theme';

interface HomeHeaderProps {
  userName?: string;
  onBellPress: () => void;
  onProfilePress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName: _userName = 'Rahul Sharma',
  onBellPress,
  onProfilePress,
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
            <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.75}
            onPress={onBellPress}>
            <Bell size={scale(20)} color="#1E293B" strokeWidth={2.2} />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileChip}
            activeOpacity={0.8}
            onPress={onProfilePress}>
            <AppImage uri="user_avatar" style={styles.avatarImg} />
          </TouchableOpacity>
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
  logo: {
    width: scale(115),
    height: scale(36),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
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

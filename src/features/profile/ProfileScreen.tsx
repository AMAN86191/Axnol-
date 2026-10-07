import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector} from '../../store';
import {
  colors,
  radius,
  scale,
  spacing,
  theme,
  verticalScale,
} from '../../theme';
import {
  FileText,
  IdCard,
  LogOut,
  LucideIcon,
  MapPin,
  Phone,
} from 'lucide-react-native';
import {useLogoutMutation} from '../../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {logout} from '../auth/authSlice';

export const ProfileScreen: React.FC = () => {
  const {user} = useAppSelector(s => s.auth);
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const doLogout = async () => {
    await logoutApi().unwrap();
    await AsyncStorage.clear();
    dispatch(logout());
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.company}>{user?.company}</Text>
      </View>
      <View style={styles.card}>
        <Row label="Phone" value={user?.phone} icon={Phone} />
        <Row label="Designation" value={user?.designation} icon={IdCard} />
        <Row
          label="Address"
          value={`${user?.address}, ${user?.city}, ${user?.state} - ${user?.pincode}`}
          icon={MapPin}
        />
        <Row label="GSTIN" value={user?.gstin || 'N/A'} icon={FileText} />
      </View>
      <TouchableOpacity style={styles.logout} onPress={doLogout}>
        <LogOut size={scale(18)} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const Row = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon: LucideIcon;
}) => (
  <View style={styles.row}>
    <Icon size={scale(16)} color={colors.textMuted} />
    <View style={{flex: 1, marginLeft: spacing.sm}}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {padding: spacing.xxl, alignItems: 'center'},
  avatar: {
    width: scale(80),
    height: verticalScale(80),
    borderRadius: scale(40),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxxl,
    color: colors.textInverse,
  },
  name: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xl,
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
  },
  company: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    marginHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  row: {flexDirection: 'row', paddingVertical: spacing.md},
  rowLabel: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textMuted,
  },
  rowValue: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.text,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xxl,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  logoutText: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});
export default ProfileScreen;

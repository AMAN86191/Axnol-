import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {
  ChevronRight,
  FileText,
  Headphones,
  LogOut,
  LucideIcon,
  MessageSquareText,
  Tag,
  UserPen,
} from 'lucide-react-native';
import {useLogoutMutation} from '../../api/services/authApi';
import {logout} from '../auth/authSlice';
import {useAppSelector} from '../../store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

interface MenuRow {
  label: string;
  icon: LucideIcon;
  screen: string;
}

const ACCOUNT_ROWS: MenuRow[] = [
  {label: 'Edit Profile', icon: UserPen, screen: 'EditProfile'},
];

const BUSINESS_ROWS: MenuRow[] = [
  {label: 'Pricing Requests', icon: Tag, screen: 'PricingRequests'},
  {label: 'My Enquiries', icon: MessageSquareText, screen: 'MyEnquiries'},
  {label: 'Documents', icon: FileText, screen: 'Documents'},
];

const SUPPORT_ROWS: MenuRow[] = [
  {label: 'Contact Us', icon: Headphones, screen: 'ContactUs'},
];

const getInitials = (name?: string) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

const MenuGroup: React.FC<{
  title: string;
  rows: MenuRow[];
  onSelect: (screen: string) => void;
}> = ({title, rows, onSelect}) => (
  <View>
    <Text style={styles.groupTitle}>{title}</Text>
    <Card padded={false}>
      {rows.map((row, index) => (
        <TouchableOpacity
          key={row.screen}
          activeOpacity={0.7}
          onPress={() => onSelect(row.screen)}
          style={[
            styles.menuRow,
            index < rows.length - 1 && styles.menuDivider,
          ]}>
          <View style={styles.menuIcon}>
            <row.icon size={scale(18)} color={colors.primary} />
          </View>
          <Text style={styles.menuLabel}>{row.label}</Text>
          <ChevronRight size={scale(18)} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </Card>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(s => s.auth);
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();

  const doLogout = async () => {
    await logoutApi().unwrap();
    await AsyncStorage.clear();
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.company}>{user?.company}</Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.roleChip,
                user?.role === 'customer' && styles.roleChipCustomer,
              ]}>
              <Text
                style={[
                  styles.roleText,
                  user?.role === 'customer' && styles.roleTextCustomer,
                ]}>
                {user?.role === 'customer' ? 'Customer' : 'Dealer'}
              </Text>
            </View>
            {user?.status ? <StatusBadge status={user.status} /> : null}
          </View>
        </Card>

        <MenuGroup
          title="Account"
          rows={ACCOUNT_ROWS}
          onSelect={screen => navigation.navigate(screen)}
        />
        <MenuGroup
          title="Business"
          rows={BUSINESS_ROWS}
          onSelect={screen => navigation.navigate(screen)}
        />
        <MenuGroup
          title="Support"
          rows={SUPPORT_ROWS}
          onSelect={screen => navigation.navigate(screen)}
        />

        <Button
          title="Log Out"
          variant="outline"
          onPress={doLogout}
          iconLeft={<LogOut size={scale(18)} color={colors.danger} />}
          textStyle={{color: colors.danger}}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  hero: {alignItems: 'center'},
  avatar: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.primary,
  },
  name: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginTop: spacing.md,
  },
  company: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  roleChip: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roleChipCustomer: {backgroundColor: colors.infoLight},
  roleText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accentDark,
  },
  roleTextCustomer: {color: colors.info},
  groupTitle: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
});

export default ProfileScreen;

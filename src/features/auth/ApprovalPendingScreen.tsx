import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Clock, Mail} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {useMeQuery} from '../../api/services/authApi';
import {useAppDispatch, useAppSelector} from '../../store';
import {logout} from './authSlice';

type Route = RouteProp<AuthStackParamList, 'ApprovalPending'>;

export const ApprovalPendingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {token, user} = useAppSelector(s => s.auth);
  const {data: me} = useMeQuery(undefined, {skip: !token, pollingInterval: 3000});
  useEffect(() => {
    if (me?.status === 'active' && !me.profileCompleted) {
      navigation.replace('ProfileSetup');
    }
  }, [me, navigation]);
  const onBack = async () => {
    dispatch(logout());
    await AsyncStorage.removeItem('axnol_token');
    await AsyncStorage.removeItem('axnol_user');
    navigation.navigate('Login');
  };
  const email = params?.email || user?.email || '';
  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom},
      ]}>
      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock size={scale(28)} color={colors.warning} />
        </View>
        <Text style={styles.title}>Account Under Review</Text>
        <Text style={styles.body}>
          Your account has been created successfully. Our team will review and
          approve your account within 24–48 hours.
        </Text>
        <View style={styles.emailRow}>
          <Mail size={scale(16)} color={colors.primary} />
          <Text style={styles.email}>{email}</Text>
        </View>
        <Text style={styles.waitNote}>
          This screen checks for approval automatically.
        </Text>
        <Button
          title="Back to Login"
          size="large"
          variant="outline"
          onPress={onBack}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {alignItems: 'center', paddingVertical: spacing.xxl},
  iconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.55,
    marginTop: spacing.md,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  email: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  waitNote: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
export default ApprovalPendingScreen;

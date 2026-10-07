import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  radius,
  scale,
  spacing,
  theme,
  verticalScale,
} from '../../theme';
import Button from '../../components/ui/Button';

type Route = RouteProp<AuthStackParamList, 'ApprovalPending'>;

export const ApprovalPendingScreen: React.FC = () => {
  const {params} = useRoute<Route>();
  useEffect(() => {}, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          resizeMode="contain"
          style={styles.logo}
        />
        <Text style={styles.title}>Account Under Review</Text>
        <Text style={styles.subtitle}>
          Thank you for registering. Our team is reviewing your application.
        </Text>
        <Text style={styles.email}>{params.email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.info}>
          Approval typically happens within 24–48 hours. You’ll receive an email
          once approved.
        </Text>
        <Button title="Back to Login" onPress={() => {}} variant="outline" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl * 1.4,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  logo: {width: scale(180), height: verticalScale(70)},
  title: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxl,
    color: colors.text,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  email: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.md,
    color: colors.primary,
    marginTop: spacing.md,
  },
  card: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  info: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: spacing.xl,
  },
});
export default ApprovalPendingScreen;

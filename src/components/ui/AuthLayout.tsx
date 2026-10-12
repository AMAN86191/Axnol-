import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme';
import AuthHeader from './AuthHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  onBack,
  right,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <LinearGradient
        colors={[colors.primaryLight, '#F6FAFE', colors.surface]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{paddingTop: insets.top + spacing.xs}}>
        <AuthHeader onBack={onBack} right={right} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {children}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
});

export default AuthLayout;

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../theme/colors';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.goBack(); // Go back after simulating a reset email being sent
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>

          <View style={styles.formContainer}>
            <InputField
              label={t('forgotPassword.email')}
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={Colors.gray} strokeWidth={1.5} />}
            />

            <CustomButton
              title={t('forgotPassword.sendResetLink')}
              onPress={handleReset}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: RFValue(12),
    color: Colors.gray,
    lineHeight: RFValue(18),
    marginBottom: hp('4%'),
  },
  formContainer: {
    width: '100%',
  },
  submitBtn: {
    marginTop: hp('2%'),
  }
});

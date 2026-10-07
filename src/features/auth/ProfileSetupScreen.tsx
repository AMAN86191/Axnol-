import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, radius, spacing, theme} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useUpdateProfileMutation} from '../../api/services/profileApi';
import {useAppDispatch, useAppSelector} from '../../store';
import {setCredentials} from './authSlice';

const schema = z.object({
  company: z.string().trim().min(2, 'Required'),
  designation: z.string().trim().min(2, 'Required'),
  address: z.string().trim().min(5, 'Required'),
  city: z.string().trim().min(2, 'Required'),
  state: z.string().trim().min(2, 'Required'),
  pincode: z.string().trim().min(4, 'Required'),
  gstin: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);
  const [update, {isLoading}] = useUpdateProfileMutation();
  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: user?.company || '',
      designation: user?.designation || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      gstin: user?.gstin || '',
    },
  });
  const onSubmit = async (values: FormValues) => {
    const res = await update({...values, completeProfile: true}).unwrap();
    if (user) {
      dispatch(setCredentials({token: null, user: res} as any));
    } // keep token if exists? better
    // update from store
    navigation.getParent()?.navigate('Main');
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us complete your business details
          </Text>
        </View>
        <View style={styles.card}>
          <Controller
            name="company"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Company Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="designation"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Designation"
                value={value}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Full Address"
                value={value}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          <View style={{flexDirection: 'row', gap: spacing.md}}>
            <View style={{flex: 1}}>
              <Controller
                name="city"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="City"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                  />
                )}
              />
            </View>
            <View style={{flex: 1}}>
              <Controller
                name="state"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="State"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                  />
                )}
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: spacing.md}}>
            <View style={{flex: 1}}>
              <Controller
                name="pincode"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="Pincode"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
            <View style={{flex: 1}}>
              <Controller
                name="gstin"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="GSTIN (Optional)"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>
          </View>
          <Button
            title="Save & Continue"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {flexGrow: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxl,
    color: colors.text,
  },
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xxl,
    flex: 1,
  },
});
export default ProfileSetupScreen;

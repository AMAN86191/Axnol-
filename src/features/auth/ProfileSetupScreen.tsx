import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft} from 'lucide-react-native';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
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
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {user, token} = useAppSelector(s => s.auth);
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
    dispatch(setCredentials({token, user: res}));
  };
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topRow, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={12}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={scale(20)} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us complete your business details
        </Text>

        <Card style={styles.card}>
          <SectionHeader title="Company Information" />
          <Controller
            name="company"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Company Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                placeholder="e.g. Sharma Auto Parts"
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
                placeholder="e.g. Purchase Manager"
              />
            )}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Address" />
          <Controller
            name="address"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Full Address"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                placeholder="Street, area, landmark"
              />
            )}
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <Controller
                name="city"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="City"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    placeholder="City"
                  />
                )}
              />
            </View>
            <View style={styles.half}>
              <Controller
                name="state"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="State"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    placeholder="State"
                  />
                )}
              />
            </View>
          </View>
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
                placeholder="Pincode"
              />
            )}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Tax Details" />
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
                placeholder="e.g. 08AABCS1429B1Z6"
              />
            )}
          />
        </Card>

        <Button
          title="Complete Profile"
          size="large"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  card: {marginBottom: spacing.lg},
  row: {flexDirection: 'row', gap: spacing.md},
  half: {flex: 1},
});
export default ProfileSetupScreen;

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
import {ArrowLeft, Building2, MapPin, Tag, UserCircle} from 'lucide-react-native';
import {colors, fontSize, scale, spacing, typography, verticalScale} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useUpdateProfileMutation} from '../../api/services/profileApi';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {setAuth} from '../../redux/AuthSlice';
import Logo from '../../components/ui/Logo';

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
    dispatch(setAuth({token, user: res}));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <View style={[styles.header, {paddingTop: insets.top || spacing.md}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={scale(24)} color={colors.primary} />
        </TouchableOpacity>
        <Logo height={verticalScale(40)} />
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + spacing.xxl}]}
        keyboardShouldPersistTaps="handled">
        
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us complete your business details to serve you better.
        </Text>

        <View style={styles.form}>
          <Controller
            name="company"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Company Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={Building2}
                placeholder="Enter company name"
                containerStyle={styles.inputSpacing}
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
                leftIcon={UserCircle}
                placeholder="e.g. Purchase Manager"
                containerStyle={styles.inputSpacing}
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
                leftIcon={MapPin}
                placeholder="Street, area, landmark"
                containerStyle={styles.inputSpacing}
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
                    containerStyle={styles.inputSpacing}
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
                    containerStyle={styles.inputSpacing}
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
                containerStyle={styles.inputSpacing}
              />
            )}
          />

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
                leftIcon={Tag}
                placeholder="e.g. 08AABCS1429B1Z6"
                containerStyle={styles.inputSpacing}
              />
            )}
          />
        </View>

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
  flex: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backBtn: {
    padding: spacing.xs,
  },
  placeholder: {
    width: scale(32),
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
    lineHeight: fontSize.sm * 1.5,
  },
  form: {
    marginBottom: spacing.md,
  },
  inputSpacing: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});
export default ProfileSetupScreen;

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../../api/services/profileApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import CommonHeader from '../../components/ui/CommonHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import {colors, spacing} from '../../theme';

type FormState = {
  name: string;
  phone: string;
  designation: string;
  company: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  designation: '',
  company: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetProfileQuery();
  const [updateProfile, {isLoading: saving}] = useUpdateProfileMutation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        designation: data.designation ?? '',
        company: data.company ?? '',
        gstin: data.gstin ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        pincode: data.pincode ?? '',
      });
    }
  }, [data]);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm(prev => ({...prev, [key]: value}));

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    try {
      await updateProfile(form).unwrap();
      Alert.alert('Profile updated');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        'Update failed',
        e?.data?.message ?? 'Please try again later.',
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Edit Profile" onBack={() => navigation.goBack()} />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <SectionHeader title="Personal" />
          <Input
            label="Full Name"
            value={form.name}
            onChangeText={setField('name')}
            placeholder="Your name"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChangeText={setField('phone')}
            placeholder="Your phone number"
            keyboardType="phone-pad"
          />
          <Input
            label="Designation"
            value={form.designation}
            onChangeText={setField('designation')}
            placeholder="Your designation"
          />
        </Card>

        <Card>
          <SectionHeader title="Company" />
          <Input
            label="Company Name"
            value={form.company}
            onChangeText={setField('company')}
            placeholder="Company name"
          />
          <Input
            label="GSTIN"
            value={form.gstin}
            onChangeText={setField('gstin')}
            placeholder="GSTIN"
            autoCapitalize="characters"
          />
        </Card>

        <Card>
          <SectionHeader title="Address" />
          <Input
            label="Address"
            value={form.address}
            onChangeText={setField('address')}
            placeholder="Street address"
            multiline
            numberOfLines={2}
          />
          <Input
            label="City"
            value={form.city}
            onChangeText={setField('city')}
            placeholder="City"
          />
          <Input
            label="State"
            value={form.state}
            onChangeText={setField('state')}
            placeholder="State"
          />
          <Input
            label="Pincode"
            value={form.pincode}
            onChangeText={setField('pincode')}
            placeholder="Pincode"
            keyboardType="number-pad"
          />
        </Card>

        <Button title="Save Changes" onPress={onSave} loading={saving} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
});

export default EditProfileScreen;

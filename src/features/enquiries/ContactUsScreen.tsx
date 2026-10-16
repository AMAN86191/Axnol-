import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Globe, Mail, MapPin, Phone} from 'lucide-react-native';
import {useGetCompanyQuery} from '../../api/services/homeApi';
import {useCreateEnquiryMutation} from '../../api/services/enquiriesApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import CommonHeader from '../../components/ui/CommonHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import {useAppSelector} from '../../store';
import {colors, fontSize, scale, spacing, typography} from '../../theme';

export const ContactUsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data: company, isLoading} = useGetCompanyQuery();
  const {user} = useAppSelector(s => s.auth);
  const [createEnquiry, {isLoading: submitting}] = useCreateEnquiryMutation();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState('');

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(
        'Missing details',
        'Please enter your name, email and message.',
      );
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    try {
      await createEnquiry({
        type: 'contact',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: 'Contact enquiry',
        message: message.trim(),
      }).unwrap();
      Alert.alert('Thank you! Your enquiry has been sent.');
      setMessage('');
    } catch (e: any) {
      Alert.alert(
        'Unable to send',
        e?.data?.message ?? 'Please try again later.',
      );
    }
  };

  if (isLoading || !company) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Contact Us" onBack={() => navigation.goBack()} />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Contact Us" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.tagline}>{company.tagline}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${company.phone}`)}>
            <View style={styles.infoIcon}>
              <Phone size={scale(17)} color={colors.primary} />
            </View>
            <Text style={styles.infoText}>{company.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.infoRow}
            onPress={() => Linking.openURL(company.website)}>
            <View style={styles.infoIcon}>
              <Globe size={scale(17)} color={colors.primary} />
            </View>
            <Text style={styles.infoText}>{company.website}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.infoRow}
            onPress={() => Linking.openURL(`mailto:${company.email}`)}>
            <View style={styles.infoIcon}>
              <Mail size={scale(17)} color={colors.primary} />
            </View>
            <Text style={styles.infoText}>{company.email}</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <SectionHeader title="Addresses" />
          <View style={styles.addrBlock}>
            <MapPin size={scale(16)} color={colors.primary} />
            <View style={styles.addrBody}>
              <Text style={styles.addrTitle}>Registered Office</Text>
              <Text style={styles.addrText}>{company.registeredOffice}</Text>
            </View>
          </View>
          <View style={styles.addrBlock}>
            <MapPin size={scale(16)} color={colors.primary} />
            <View style={styles.addrBody}>
              <Text style={styles.addrTitle}>Factory</Text>
              <Text style={styles.addrText}>{company.factory}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <SectionHeader title="Send us a message" />
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Your phone number"
            keyboardType="phone-pad"
          />
          <Input
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help you?"
            multiline
            numberOfLines={4}
          />
          <Button
            title="Submit Enquiry"
            onPress={onSubmit}
            loading={submitting}
          />
        </Card>
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
  companyName: {
    ...typography.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  tagline: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.accentDark,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  addrBlock: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addrBody: {flex: 1},
  addrTitle: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addrText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.5,
  },
});

export default ContactUsScreen;

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
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {
  Building2,
  Factory,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Tag,
  User,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import {useGetCompanyQuery} from '../../api/services/homeApi';
import {useCreateEnquiryMutation} from '../../api/services/enquiriesApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import CommonHeader from '../../components/ui/CommonHeader';
import {useAppSelector} from '../../store';
import {colors, fontSize, radius, scale, shadows, spacing} from '../../theme';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

interface AddressBlockProps {
  icon: LucideIcon;
  title: string;
  text: string;
}

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => {});
};

const AddressBlock: React.FC<AddressBlockProps> = ({
  icon: Icon,
  title,
  text,
}) => (
  <View style={styles.addressRow}>
    <View style={styles.addressIconWrap}>
      <Icon size={scale(17)} color={colors.primary} strokeWidth={2.2} />
    </View>
    <View style={styles.addressBody}>
      <Text style={styles.addressTitle}>{title}</Text>
      <Text style={styles.addressText}>{text}</Text>
    </View>
  </View>
);

export const ContactUsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data: company, isLoading} = useGetCompanyQuery();
  const {user} = useAppSelector(s => s.auth);

  const [createEnquiry, {isLoading: submitting}] = useCreateEnquiryMutation();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const clearError = (field: string) =>
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = {...prev};
      delete next[field];
      return next;
    });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) {
      next.name = 'Please enter your name';
    }
    if (!email.trim()) {
      next.email = 'Please enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!message.trim()) {
      next.message = 'Please enter your message';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    try {
      await createEnquiry({
        type: 'contact',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      }).unwrap();
      Alert.alert(
        'Message Sent',
        'Thank you for reaching out. Our team will contact you soon.',
      );
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert('Something went wrong', 'Please try again in a moment.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      icon: Phone,
      label: 'Call Us',
      onPress: () => openUrl(`tel:${company.phone.replace(/\s/g, '')}`),
    },
    {
      icon: Mail,
      label: 'Email',
      onPress: () => openUrl(`mailto:${company.email}`),
    },
    {
      icon: Globe,
      label: 'Website',
      onPress: () => openUrl(company.website),
    },
  ];

  return (
    <View style={styles.container}>
      <CommonHeader title="Help & Support" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroDot} />
            <Text style={styles.heroEyebrow}>GET IN TOUCH</Text>
          </View>

          <Text style={styles.heroName}>{company.name}</Text>
          <Text style={styles.heroTagline}>{company.tagline}</Text>

          <View style={styles.heroSincePill}>
            <Text style={styles.heroSinceText}>
              Trusted Since {company.since}
            </Text>
          </View>

          {/* {company.stats.length > 0 ? (
            <View style={styles.statsWrap}>
              {company.stats.map(stat => (
                <View key={stat.label} style={styles.statChip}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null} */}
        </LinearGradient>

        {/* Quick actions */}
        <Card style={styles.quickCard}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.quickTile,
                index > 0 && styles.quickTileBorder,
              ]}
              activeOpacity={0.7}
              onPress={action.onPress}>
              <View style={styles.quickIconWrap}>
                <action.icon
                  size={scale(19)}
                  color={colors.primary}
                  strokeWidth={2.2}
                />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Locations */}
        <Card>
          <Text style={styles.cardTitle}>Our Locations</Text>
          <AddressBlock
            icon={Building2}
            title="Registered Office"
            text={company.registeredOffice}
          />
          <View style={styles.divider} />
          <AddressBlock
            icon={Factory}
            title="Factory"
            text={company.factory}
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

  /* Hero */
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: spacing.sm,
  },
  heroDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: colors.accent,
  },
  heroEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.85)',
  },
  heroName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -0.3,
    lineHeight: fontSize.xl * 1.25,
  },
  heroTagline: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.82)',
    marginTop: scale(4),
    lineHeight: fontSize.sm * 1.4,
  },
  heroSincePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: scale(11),
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  heroSinceText: {
    fontSize: scale(10.5),
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.2,
  },
  statsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: spacing.lg,
  },
  statChip: {
    minWidth: scale(76),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: scale(1),
  },

  /* Quick actions */
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    overflow: 'hidden',
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: scale(8),
  },
  quickTileBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  quickIconWrap: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },

  /* Locations */
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: spacing.md,
  },
  cardIntro: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  addressBody: {flex: 1},
  addressTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    lineHeight: fontSize.sm * 1.5,
    marginTop: scale(3),
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  /* Form */
  field: {marginBottom: spacing.md},
});

export default ContactUsScreen;

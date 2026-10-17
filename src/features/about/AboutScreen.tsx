import React from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Award,
  Building2,
  Car,
  ChevronRight,
  Droplets,
  Factory,
  Fuel,
  Globe,
  Handshake,
  Leaf,
  Mail,
  MapPin,
  Mountain,
  Package,
  Phone,
  Plane,
  Quote,
  ShieldCheck,
  Target,
  Users,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, shadows, spacing} from '../../theme';

interface OfferingProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface IndustryProps {
  icon: LucideIcon;
  label: string;
}

interface StrengthProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StatProps {
  icon: LucideIcon;
  value: string;
  label: string;
  tint: string;
}

interface ContactRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress?: () => void;
}

const OFFERINGS: OfferingProps[] = [
  {
    icon: Droplets,
    title: 'Specialty Lubricants',
    description:
      'Quality lubricants and greases manufactured for diverse industrial needs.',
  },
  {
    icon: Package,
    title: 'Base Oils & Waxes',
    description:
      'Base oils and paraffin waxes sourced from international refineries.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Serving domestic markets and exporting to international destinations.',
  },
  {
    icon: Handshake,
    title: 'Technical Partnerships',
    description:
      'Sharing technology and expertise with partners to improve product quality.',
  },
];

const PRODUCT_CATEGORIES: string[] = [
  'Lubricating Oils',
  'Industrial Greases',
  'Base Oil',
  'Chemical & Additives',
  'Punching Oils',
  'Food Grade Lubricants',
];

const INDUSTRIES: IndustryProps[] = [
  {icon: Car, label: 'Automotive'},
  {icon: Factory, label: 'Steel'},
  {icon: Building2, label: 'Cement'},
  {icon: Plane, label: 'Aviation'},
  {icon: Wheat, label: 'Agriculture'},
  {icon: Mountain, label: 'Mining'},
  {icon: UtensilsCrossed, label: 'Food Processing'},
  {icon: Fuel, label: 'Oil & Gas'},
];

const STRENGTHS: StrengthProps[] = [
  {
    icon: ShieldCheck,
    title: 'Quality & Consistency',
    description:
      'Committed to consistent quality products, regularity in supply and services.',
  },
  {
    icon: Users,
    title: 'Strong Partnerships',
    description:
      'Lasting relationships built with customers, partners and stakeholders.',
  },
  {
    icon: Target,
    title: 'Operational Excellence',
    description:
      'Delivering reliable performance while improving efficiency across operations.',
  },
  {
    icon: Leaf,
    title: 'Environmental Responsibility',
    description:
      'Supporting environmentally conscious practices and efficient use of resources.',
  },
];

const STATS: StatProps[] = [
  {icon: Award, value: '1959', label: 'Trusted Since', tint: colors.primary},
  {icon: Globe, value: '67+', label: 'Years of Leadership', tint: colors.accent},
  {
    icon: Handshake,
    value: 'Global',
    label: 'Sourcing & Exports',
    tint: colors.primary,
  },
];

const CONTACT_ROWS: ContactRowProps[] = [
  {
    icon: MapPin,
    label: 'Registered Office',
    value:
      'Shanti Niketan - Kh 65, Ground Floor, Bhawaninagar, Murlipura-302039, Jaipur, Rajasthan, India',
  },
  {
    icon: Factory,
    label: 'Factory',
    value:
      'Plot No-3-4, Sai Kripa Industrial Extension, Jatawali, Jaipur, Rajasthan, India',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 94390 98999',
    onPress: () => Linking.openURL('tel:+919439098999').catch(() => {}),
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@axnol.in',
    onPress: () => Linking.openURL('mailto:contact@axnol.in').catch(() => {}),
  },
  {
    icon: Globe,
    label: 'Website',
    value: 'axnol.tambimotors.com',
    onPress: () =>
      Linking.openURL('https://axnol.tambimotors.com').catch(() => {}),
  },
];

interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({title, subtitle}) => (
  <View style={styles.sectionHeading}>
    <View style={styles.sectionAccentBar} />
    <View style={styles.sectionHeadingText}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const OfferingTile: React.FC<OfferingProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <View style={styles.offeringTile}>
    <View style={styles.offeringIconWrap}>
      <Icon size={scale(19)} color={colors.primary} strokeWidth={2.2} />
    </View>
    <Text style={styles.offeringTitle}>{title}</Text>
    <Text style={styles.offeringDescription}>{description}</Text>
  </View>
);

const StrengthRow: React.FC<StrengthProps & {isLast: boolean}> = ({
  icon: Icon,
  title,
  description,
  isLast,
}) => (
  <View style={[styles.strengthRow, !isLast && styles.rowDivider]}>
    <View style={styles.strengthIconWrap}>
      <Icon size={scale(16)} color={colors.primary} strokeWidth={2.2} />
    </View>
    <View style={styles.strengthTextWrap}>
      <Text style={styles.strengthTitle}>{title}</Text>
      <Text style={styles.strengthDescription}>{description}</Text>
    </View>
  </View>
);

const ContactRow: React.FC<ContactRowProps & {isLast: boolean}> = ({
  icon: Icon,
  label,
  value,
  onPress,
  isLast,
}) => {
  const content = (
    <>
      <View style={styles.contactIconWrap}>
        <Icon size={scale(16)} color={colors.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.contactTextWrap}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={[styles.contactValue, onPress && styles.contactAction]}>
          {value}
        </Text>
      </View>
      {onPress ? (
        <ChevronRight
          size={scale(16)}
          color={colors.textMuted}
          strokeWidth={2.2}
        />
      ) : null}
    </>
  );

  return onPress ? (
    <TouchableOpacity
      style={[styles.contactRow, !isLast && styles.rowDivider]}
      activeOpacity={0.7}
      onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={[styles.contactRow, !isLast && styles.rowDivider]}>
      {content}
    </View>
  );
};

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <CommonHeader
        title="About Us"
        titleColor="#0F172A"
        iconColor="#0F172A"
        borderColor="#E8EDF3"
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + scale(32)}}>
        {/* Hero — logo only */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.logoShadow}>
              <AppImage
                uri="logo"
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.heroTagline}>
              TRUSTED LUBRICATION EXPERTISE
            </Text>
            <Text style={styles.heroTitle}>
              Axnol Lubetech India Pvt. Ltd.
            </Text>

            <View style={styles.sincePill}>
              <Text style={styles.sincePillText}>
                Serving Industries Since 1959
              </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {STATS.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  {index > 0 && <View style={styles.statDivider} />}
                  <View style={styles.statItem}>
                    <stat.icon
                      size={scale(16)}
                      color={stat.tint}
                      strokeWidth={2.2}
                    />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>
                      {stat.label}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* About */}
          <View style={styles.card}>
            <SectionHeading title="About Axnol" subtitle="Who we are" />
            <Text style={styles.bodyText}>
              Axnol Lubetech India Pvt. Ltd. is a specialty lubricants and
              grease manufacturer in India, delivering quality lubrication
              solutions for diverse industrial applications.
            </Text>
            <Text style={styles.bodyText}>
              Our expertise spans base oils, paraffin waxes, international
              sourcing, OEM product development, and technical partnerships,
              serving customers across India and global markets.
            </Text>

            <View style={styles.quoteBox}>
              <Quote
                size={scale(15)}
                color={colors.accent}
                strokeWidth={2.4}
                style={styles.quoteIcon}
              />
              <Text style={styles.quoteText}>
                Driven by innovation, committed to quality, and focused on a
                sustainable industrial future.
              </Text>
            </View>
          </View>

          {/* What We Do */}
          <View style={styles.card}>
            <SectionHeading
              title="What We Do"
              subtitle="Powering industries with trusted lubrication"
            />
            <View style={styles.offeringGrid}>
              {OFFERINGS.map(item => (
                <OfferingTile key={item.title} {...item} />
              ))}
            </View>

            <View style={styles.innerDivider} />

            <Text style={styles.subLabel}>Product Categories</Text>
            <View style={styles.chipWrap}>
              {PRODUCT_CATEGORIES.map(category => (
                <View key={category} style={styles.chip}>
                  <Text style={styles.chipText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Industries */}
          <View style={styles.card}>
            <SectionHeading
              title="Industries We Serve"
              subtitle="Solutions built for every sector"
            />
            <View style={styles.industryGrid}>
              {INDUSTRIES.map((item, index) => (
                <View key={item.label} style={styles.industryTile}>
                  <View
                    style={[
                      styles.industryIconWrap,
                      {
                        backgroundColor:
                          index % 2 === 0
                            ? colors.primaryLight
                            : colors.accentLight,
                      },
                    ]}>
                    <item.icon
                      size={scale(17)}
                      color={index % 2 === 0 ? colors.primary : colors.accentDark}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text style={styles.industryLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Our Vision */}
          <View style={styles.card}>
            <SectionHeading title="Our Vision" subtitle="Responsible growth" />
            <LinearGradient
              colors={[colors.primaryLight, '#F6FAFE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.visionCard}>
              <View style={styles.visionAccent} />
              <View style={styles.visionContent}>
                <Text style={styles.visionText}>
                  We promote responsible resource use, lasting partnerships,
                  and sustainable industrial development.
                </Text>
                <View style={styles.visionFooter}>
                  <Target
                    size={scale(13)}
                    color={colors.primary}
                    strokeWidth={2.4}
                  />
                  <Text style={styles.visionFooterText}>
                    Sustainable Industrial Future
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Why Choose Axnol */}
          <View style={styles.card}>
            <SectionHeading
              title="Why Choose Axnol"
              subtitle="Built on trust and expertise"
            />
            <View>
              {STRENGTHS.map((item, index) => (
                <StrengthRow
                  key={item.title}
                  {...item}
                  isLast={index === STRENGTHS.length - 1}
                />
              ))}
            </View>
          </View>

          {/* Get in Touch */}
          <View style={styles.card}>
            <SectionHeading
              title="Get in Touch"
              subtitle="We would love to hear from you"
            />
            <View>
              {CONTACT_ROWS.map((row, index) => (
                <ContactRow
                  key={row.label}
                  {...row}
                  isLast={index === CONTACT_ROWS.length - 1}
                />
              ))}
            </View>
          </View>

          <Text style={styles.footerNote}>
            © {new Date().getFullYear()} Axnol Lubetech India Pvt. Ltd.
            {'\n'}All Rights Reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },

  /* Hero — logo only */
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoShadow: {
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: scale(160),
    height: scale(50),
  },
  heroTagline: {
    fontSize: scale(9),
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  heroTitle: {
    fontSize: scale(20),
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginTop: scale(3),
  },
  sincePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: '#FCD98A',
  },
  sincePillText: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: colors.accentDark,
    letterSpacing: 0.1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: scale(2),
  },
  statDivider: {
    width: 1,
    height: scale(34),
    backgroundColor: colors.border,
    marginHorizontal: scale(6),
  },
  statValue: {
    fontSize: scale(15),
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: colors.textMuted,
  },

  /* Body */
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.small,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionAccentBar: {
    width: scale(3),
    height: scale(32),
    borderRadius: scale(2),
    backgroundColor: colors.primary,
    marginRight: spacing.sm + scale(3),
    marginTop: scale(1),
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: scale(20),
  },
  sectionSubtitle: {
    fontSize: scale(11),
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: scale(1),
  },

  /* About */
  bodyText: {
    fontSize: fontSize.sm,
    lineHeight: scale(19),
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FCE7B8',
    padding: scale(11),
    marginTop: scale(2),
  },
  quoteIcon: {
    marginTop: scale(2),
  },
  quoteText: {
    flex: 1,
    fontSize: scale(11.5),
    lineHeight: scale(17),
    fontStyle: 'italic',
    fontWeight: '600',
    color: colors.text,
  },

  /* What we do */
  offeringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  offeringTile: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: scale(11),
  },
  offeringIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(10),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(8),
  },
  offeringTitle: {
    fontSize: scale(12),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.1,
  },
  offeringDescription: {
    fontSize: scale(10),
    lineHeight: scale(14),
    color: colors.textSecondary,
    marginTop: scale(3),
  },
  innerDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  subLabel: {
    fontSize: scale(12),
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(7),
  },
  chip: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  chipText: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: colors.primary,
  },

  /* Industries */
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(9),
  },
  industryTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
  },
  industryIconWrap: {
    width: scale(31),
    height: scale(31),
    borderRadius: scale(9),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  industryLabel: {
    flex: 1,
    fontSize: scale(11.5),
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.1,
  },

  /* Vision */
  visionCard: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    overflow: 'hidden',
  },
  visionAccent: {
    width: scale(4),
    backgroundColor: colors.primary,
  },
  visionContent: {
    flex: 1,
    padding: scale(13),
  },
  visionText: {
    fontSize: scale(12.5),
    lineHeight: scale(19),
    fontWeight: '600',
    color: colors.text,
  },
  visionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: scale(10),
  },
  visionFooterText: {
    fontSize: scale(10.5),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
  },

  /* Why choose */
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(11),
  },
  strengthIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(9),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  strengthTextWrap: {
    flex: 1,
  },
  strengthTitle: {
    fontSize: scale(12.5),
    fontWeight: '800',
    color: colors.text,
  },
  strengthDescription: {
    fontSize: scale(11),
    lineHeight: scale(16),
    color: colors.textSecondary,
    marginTop: scale(2),
  },

  /* Contact */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(11),
  },
  contactIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(9),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: scale(11.5),
    lineHeight: scale(16),
    color: colors.text,
    fontWeight: '600',
    marginTop: scale(2),
  },
  contactAction: {
    color: colors.primary,
  },

  footerNote: {
    textAlign: 'center',
    fontSize: scale(10),
    lineHeight: scale(15),
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: scale(8),
  },
});

export default AboutScreen;

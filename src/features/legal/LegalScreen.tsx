import React from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CommonHeader from '../../components/ui/CommonHeader';
import {colors, fontSize, radius, scale, shadows, spacing} from '../../theme';
import {LegalContent} from './legalContent';

interface LegalScreenProps {
  content: LegalContent;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({content}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <CommonHeader title={content.title} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + scale(32)},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.updated}>{content.updated}</Text>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

        {content.sections.map((section, index) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {index + 1}. {section.title}
            </Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>
          © {new Date().getFullYear()} Axnol. All rights reserved.
        </Text>
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadows.small as object),
  },
  updated: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  intro: {
    fontSize: fontSize.md,
    lineHeight: scale(21),
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontSize: fontSize.md,
    lineHeight: scale(21),
    color: colors.textSecondary,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default LegalScreen;

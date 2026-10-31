import React, {useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronDown, FileText, Search, ShieldCheck, X} from 'lucide-react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import {LegalContent} from './legalContent';

interface LegalScreenProps {
  content: LegalContent;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({content}) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return content.sections.map((section, index) => ({section, index}));
    }

    return content.sections
      .map((section, index) => ({section, index}))
      .filter(({section}) =>
        [
          section.title,
          section.body,
          ...(section.bullets ?? []),
          ...(section.after ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query),
      );
  }, [content.sections, search]);

  const allExpanded = filteredSections.every(
    ({section}) => expandedSections[section.title] ?? true,
  );
  const toggleAll = () => {
    setExpandedSections(current => {
      const next = {...current};
      filteredSections.forEach(({section}) => {
        next[section.title] = !allExpanded;
      });
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <CommonHeader title={content.title} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + scale(28)},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{content.title}</Text>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

    

        <View style={styles.sectionsHeader}>
          <View>
            {/* <Text style={styles.sectionsTitle}>Policy details</Text> */}
            {search.trim() ? (
              <Text style={styles.resultCount}>
                {filteredSections.length}{' '}
                {filteredSections.length === 1 ? 'section' : 'sections'} found
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={toggleAll}
            activeOpacity={0.75}
            accessibilityRole="button">
            <Text style={styles.expandAllText}>
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </Text>
          </TouchableOpacity>
        </View>

        {filteredSections.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={scale(22)} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching details</Text>
            <Text style={styles.emptyText}>
              Try another keyword or clear your search.
            </Text>
          </View>
        ) : (
          filteredSections.map(({section, index}) => {
            const expanded = search.trim()
              ? true
              : expandedSections[section.title] ?? true;

            return (
              <View key={section.title} style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.75}
                  onPress={() =>
                    setExpandedSections(current => ({
                      ...current,
                      [section.title]: !expanded,
                    }))
                  }
                  accessibilityRole="button"
                  accessibilityState={{expanded}}>
                  <View style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <ChevronDown
                    size={scale(18)}
                    color={colors.textMuted}
                    style={[
                      styles.chevron,
                      expanded && styles.chevronExpanded,
                    ]}
                  />
                </TouchableOpacity>

                {expanded ? (
                  <View style={styles.sectionContent}>
                    {section.body ? (
                      <Text style={styles.sectionBody}>{section.body}</Text>
                    ) : null}
                    {section.bullets?.map((item, bulletIndex) => (
                      <View
                        key={`${section.title}-bullet-${bulletIndex}`}
                        style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={[styles.sectionBody, styles.listText]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                    {section.after?.map((paragraph, paragraphIndex) => (
                      <Text
                        key={`${section.title}-after-${paragraphIndex}`}
                        style={[
                          styles.sectionBody,
                          Boolean(section.body || section.bullets?.length) &&
                            styles.followingParagraph,
                        ]}>
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <Text style={styles.footerNote}>
          © Copyright Axnol Lubetech India Pvt.Ltd. 2025. ALL Right Reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  updatedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: '#F3F6FA',
  },
  updatedDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  updated: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: scale(21),
    textAlign: 'justify',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  readHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  searchBar: {
    minHeight: scale(46),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  searchInput: {
    flex: 1,
    minHeight: scale(44),
    paddingVertical: 0,
    color: colors.text,
    fontSize: fontSize.md,
  },
  clearSearch: {
    width: scale(30),
    height: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: scale(2),
  },
  sectionsTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: scale(2),
  },
  expandAllText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  sectionHeader: {
    minHeight: scale(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionNumber: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius.sm,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionNumberText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: scale(19),
    fontWeight: '700',
  },
  chevron: {
    marginLeft: spacing.sm,
    transform: [{rotate: '0deg'}],
  },
  chevronExpanded: {
    transform: [{rotate: '180deg'}],
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: scale(22),
    textAlign: 'justify',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  bullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: scale(8),
    marginRight: spacing.md,
  },
  listText: {
    flex: 1,
  },
  followingParagraph: {
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  emptyTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LegalScreen;

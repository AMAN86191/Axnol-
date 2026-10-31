import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, scale, shadows, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import CachedImage from '../../components/ui/CachedImage';
import { useAppDispatch } from '../../redux/hooks';
import { useAppSelector } from '../../store';
import { fetchIndustriesSlice } from '../../redux/IndustrySlice';
import { getLoadErrorMessage } from '../../utils/apiError';
import IndustriesSkeleton from './components/IndustriesSkeleton';

const COLUMNS = 3;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const IndustriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  // The list lives in Redux, so reopening the screen shows it straight away.
  const apiIndustries = useAppSelector(s => s.industry.industries);
  const industriesLoading = useAppSelector(s => s.industry.loading);
  const loadError = useAppSelector(s => s.industry.error);
  const loading = industriesLoading && apiIndustries.length === 0;

  const fetchData = useCallback(
    () =>
      dispatch(fetchIndustriesSlice())
        .unwrap()
        .catch(() => undefined),
    [dispatch],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadErrorMessage = getLoadErrorMessage(loadError, 'industries');

  const industries = apiIndustries
    .map(item => ({
      id: String(item.id),
      name: item.title,
      image: item.image_url ?? '',
      brochure_url: item.brochure_url ?? '',
    }))
    .filter(item => Boolean(item.image && item.image.trim()));

  const filtered = industries.filter(
    item => !search || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader title="Industries" />

      {loading ? (
        <IndustriesSkeleton />
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Search size={scale(18)} color="#94A3B8" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search industries..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + scale(80) },
            ]}
          >
            {filtered.length === 0 && loadErrorMessage ? (
              <View style={styles.errorWrap}>
                <Text style={styles.emptyText}>{loadErrorMessage}</Text>
                <TouchableOpacity onPress={fetchData} activeOpacity={0.8}>
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : filtered.length === 0 ? (
              <Text style={styles.emptyText}>No industries found</Text>
            ) : (
              chunk(filtered, COLUMNS).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.tile}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('IndustryDetails', {
                        industryId: item.id,
                        industryTitle: item.name,
                        industrybrochure: item.brochure_url,
                      })
                    }
                  >
                    <View style={styles.cardWrap}>
                      <View style={styles.imageWrap}>
                        <CachedImage
                          uri={item.image}
                          style={styles.image}
                          placeholder={
                            <View
                              style={[
                                styles.image,
                                styles.fallbackWrap,
                                StyleSheet.absoluteFillObject,
                              ]}
                            />
                          }
                          fallback={
                            <View
                              style={[
                                styles.image,
                                styles.fallbackWrap,
                                StyleSheet.absoluteFillObject,
                              ]}
                            >
                              <Text style={styles.fallbackText}>
                                {item.name?.charAt(0)?.toUpperCase() || '?'}
                              </Text>
                            </View>
                          }
                        />
                      </View>
                      <Text style={styles.tileTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  ))}
                  {Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                    <View key={`fill-${i}`} style={styles.tileFill} />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: scale(45),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: scale(13.5),
    color: '#0F172A',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
  },
  tileFill: {
    flex: 1,
  },
  cardWrap: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: scale(6),
    paddingVertical: scale(10),
    ...shadows.medium
  },
  imageWrap: {
    width: '100%',
    height: scale(76),
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tileTitle: {
    fontSize: scale(11.5),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: scale(10),
    textAlign: 'center',
    letterSpacing: -0.1,
    minHeight: scale(30),
    lineHeight: scale(15),
  },
  fallbackWrap: {
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: scale(12.5),
    color: '#718096',
    paddingVertical: spacing.xl,
  },
  errorWrap: {
    alignItems: 'center',
  },
  retryText: {
    color: '#2563EB',
    fontSize: scale(12),
    fontWeight: '700',
    paddingVertical: spacing.sm,
  },
});

export default IndustriesScreen;

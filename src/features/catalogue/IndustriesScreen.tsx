import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import PageHero, { DEFAULT_HERO_IMAGES } from '../../components/ui/PageHero';
import BrandFooter from '../../components/ui/BrandFooter';
import IndustryCard from './components/IndustryCard';
import { useAppDispatch } from '../../redux/hooks';
import { useAppSelector } from '../../store';
import { fetchIndustriesSlice } from '../../redux/IndustrySlice';
import { getLoadErrorMessage } from '../../utils/apiError';
import IndustriesSkeleton from './components/IndustriesSkeleton';

const COLUMNS = 3;
const PAGE_BG = '#F1F5F3';

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

      <CommonHeader title="Industries" />

      {loading ? (
        <IndustriesSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + scale(90) }}
        >
          <PageHero
            title="Industries"
            subtitle="Sourcing Hub"
            images={DEFAULT_HERO_IMAGES}
          />

          <View style={styles.listContent}>
            {industries.length === 0 && loadErrorMessage ? (
              <View style={styles.errorWrap}>
                <Text style={styles.emptyText}>{loadErrorMessage}</Text>
                <TouchableOpacity onPress={fetchData} activeOpacity={0.8}>
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : industries.length === 0 ? (
              <Text style={styles.emptyText}>No industries found</Text>
            ) : (
              chunk(industries, COLUMNS).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map(item => (
                    <IndustryCard
                      key={item.id}
                      name={item.name}
                      image={item.image}
                      onPress={() =>
                        navigation.navigate('IndustryDetails', {
                          industryId: item.id,
                          industryTitle: item.name,
                          industrybrochure: item.brochure_url,
                        })
                      }
                    />
                  ))}
                  {Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                    <View key={`fill-${i}`} style={styles.tileFill} />
                  ))}
                </View>
              ))
            )}
          </View>

          <BrandFooter title={"Every industry,\none place"} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: scale(9),
    marginBottom: scale(9),
  },
  tileFill: {
    flex: 1,
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

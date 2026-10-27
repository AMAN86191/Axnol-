import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
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
import { radius, scale, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import { getIndustries, Industry } from '../../api/IndustryProvider';
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
  const [search, setSearch] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const timersRef = useRef<Record<string, any>>({});
  const [apiIndustries, setApiIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getIndustries();
      setApiIndustries(response?.data?.industries ?? []);
    } catch (error) {
      setLoadError(error);
      console.error('Failed to load industries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Object.values(timersRef.current).forEach(t => clearTimeout(t));
    timersRef.current = {};
  }, [apiIndustries]);

  useEffect(() => {
    const timeouts: Record<string, any> = {};
    apiIndustries.forEach(item => {
      const image = (item as any).image_url ?? (item as any).image ?? '';
      if (image && !loadedImages[item.id] && !failedImages[item.id]) {
        timeouts[item.id] = setTimeout(() => {
          setFailedImages(prev => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
        }, 8000);
      }
    });
    timersRef.current = timeouts;
    return () => {
      Object.values(timeouts).forEach(t => clearTimeout(t));
    };
  }, [apiIndustries, loadedImages, failedImages]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
      timersRef.current = {};
    };
  }, []);

  useEffect(() => {
    apiIndustries.forEach(item => {
      const image = (item as any).image_url ?? (item as any).image ?? '';
      if (image) {
        Image.prefetch(image).catch(() => undefined);
      }
    });
  }, [apiIndustries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadErrorMessage = getLoadErrorMessage(loadError, 'industries');

  const industries = apiIndustries
    .map(item => ({
      id: String(item.id),
      name: item.title,
      image: item.image_url ?? '',
    }))
    .filter(item => Boolean(item.image && item.image.trim()));

  const filtered = industries.filter(
    item => !search || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    filtered.forEach(item => {
      if (item.image && !loadedImages[item.id]) {
        Image.prefetch(item.image).catch(() => undefined);
      }
    });
  }, [filtered, loadedImages]);

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
              <Search size={scale(18)} color="#718096" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search industries"
                placeholderTextColor="#718096"
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
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('IndustryDetails', {
                          industryId: item.id,
                          industryTitle: item.name,
                        })
                      }
                    >
                      <View style={styles.imageWrap}>
                        {item.image ? (
                          <Image
                            key={`${item.id}`}
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="cover"
                            onLoad={() => {
                              if (timersRef.current[item.id]) {
                                clearTimeout(timersRef.current[item.id]);
                                delete timersRef.current[item.id];
                              }
                              setLoadedImages(prev => ({ ...prev, [item.id]: true }));
                            }}
                            onLoadEnd={() => {
                              if (timersRef.current[item.id]) {
                                clearTimeout(timersRef.current[item.id]);
                                delete timersRef.current[item.id];
                              }
                              setLoadedImages(prev => ({ ...prev, [item.id]: true }));
                            }}
                            onError={() => {
                              if (timersRef.current[item.id]) {
                                clearTimeout(timersRef.current[item.id]);
                                delete timersRef.current[item.id];
                              }
                            }}
                          />
                        ) : null}
                        {(!item.image || failedImages[item.id]) && !loadedImages[item.id] && (
                          <View style={[styles.image, styles.fallbackWrap, StyleSheet.absoluteFillObject]}>
                            <Text style={styles.fallbackText}>
                              {item.name?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tileTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
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
    backgroundColor: '#F7F9FC',
  },
  searchBarContainer: {
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: scale(44),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: scale(13),
    color: '#172033',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
  },
  tileFill: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    height: scale(78),
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tileTitle: {
    fontSize: scale(11),
    fontWeight: '400',
    color: '#172033',
    marginTop: scale(8),
    marginBottom: scale(2),
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

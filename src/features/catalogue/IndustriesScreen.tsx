import React from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography, verticalScale} from '../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const INDUSTRIES_DATA = [
  {
    id: 'ind2',
    name: 'Automotive',
    subtitle: 'High performance lubricants',
    image: 'industry_2',
  },
  {
    id: 'ind1',
    name: 'Industrial',
    subtitle: 'Reliable industrial solutions',
    image: 'industry_1',
  },
  {
    id: 'ind4',
    name: 'Marine',
    subtitle: 'Engine protection at sea',
    image: 'industry_4',
  },
  {
    id: 'ind6',
    name: 'Construction',
    subtitle: 'Heavy duty protection',
    image: 'industry_6',
  },
  {
    id: 'ind3',
    name: 'Agriculture',
    subtitle: 'For farming equipment',
    image: 'industry_3',
  },
  {
    id: 'ind8',
    name: 'Energy',
    subtitle: 'Powering the future',
    image: 'industry_8',
  },
];

export const IndustriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Industries</Text>
        <View style={{width: scale(24)}} />
      </View>

      <FlatList
        data={INDUSTRIES_DATA}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + scale(80)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Products', {
                title: item.name,
                industryId: item.id,
              })
            }>
            <View style={styles.imageWrap}>
              <AppImage uri={item.image} style={styles.image} resizeMode="cover" />
            </View>

            <View style={styles.cardContent}>
              <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <ChevronRight size={scale(16)} color="#0284C7" style={styles.arrow} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    height: verticalScale(105),
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: scale(65),
  },
  cardTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: scale(11),
    color: '#64748B',
    lineHeight: scale(15),
  },
  arrow: {
    marginLeft: 4,
    marginBottom: 2,
  },
});

export default IndustriesScreen;

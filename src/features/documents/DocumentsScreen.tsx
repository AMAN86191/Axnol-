import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronRight, FileText} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';

const FILTER_TABS = ['All', 'Technical Data', 'Safety Data', 'Brochure'];

const MOCK_DOCUMENTS = [
  {
    id: 'doc1',
    title: 'Product Brochure',
    category: 'Brochure',
    size: 'PDF • 2.4 MB',
    url: 'https://axnol.in/pdf/brochure.pdf',
  },
  {
    id: 'doc2',
    title: 'Technical Data Sheet',
    category: 'Technical Data',
    size: 'PDF • 1.8 MB',
    url: 'https://axnol.in/pdf/tds.pdf',
  },
  {
    id: 'doc3',
    title: 'Safety Data Sheet',
    category: 'Safety Data',
    size: 'PDF • 1.1 MB',
    url: 'https://axnol.in/pdf/sds.pdf',
  },
  {
    id: 'doc4',
    title: 'Certificate of Analysis',
    category: 'Technical Data',
    size: 'PDF • 1.5 MB',
    url: 'https://axnol.in/pdf/coa.pdf',
  },
  {
    id: 'doc5',
    title: 'Application Guide',
    category: 'Brochure',
    size: 'PDF • 1.9 MB',
    url: 'https://axnol.in/pdf/guide.pdf',
  },
  {
    id: 'doc6',
    title: 'Material Compatibility',
    category: 'Technical Data',
    size: 'PDF • 2.2 MB',
    url: 'https://axnol.in/pdf/compatibility.pdf',
  },
];

export const DocumentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filtered = MOCK_DOCUMENTS.filter(doc => {
    if (selectedFilter === 'All') return true;
    return doc.category.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const handleOpenDoc = (doc: (typeof MOCK_DOCUMENTS)[0]) => {
    Alert.alert(
      doc.title,
      `${doc.size}\nTap download to view this document.`,
      [
        {text: 'Download & View', onPress: () => Alert.alert('Downloading', `${doc.title}.pdf is opening...`)},
        {text: 'Cancel'},
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader title="Documents" />

      {/* Horizontal Filter Tabs */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({item}) => {
            const active = item === selectedFilter;
            return (
              <TouchableOpacity
                style={[styles.filterPill, active && styles.filterPillActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(item)}>
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Documents List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + scale(80)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.docCard}
            activeOpacity={0.85}
            onPress={() => handleOpenDoc(item)}>
            <View style={styles.pdfIconWrap}>
              <FileText size={scale(22)} color="#EF4444" strokeWidth={2} />
            </View>

            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>{item.title}</Text>
              <Text style={styles.docSize}>{item.size}</Text>
            </View>

            <ChevronRight size={scale(18)} color="#94A3B8" />
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
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
  },
  filterPillText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pdfIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  docSize: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
});

export default DocumentsScreen;

import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Download, FileText, FolderOpen} from 'lucide-react-native';
import {useGetDocumentsQuery} from '../../api/services/documentsApi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SearchBar from '../../components/ui/SearchBar';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

export const DocumentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const {data, isLoading} = useGetDocumentsQuery({
    search: search || undefined,
  });

  const openDocument = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open this document.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Documents" onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.searchWrap}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search documents"
              />
            </View>
          }
          ListEmptyComponent={
            <EmptyState icon={FolderOpen} title="No documents found" />
          }
          renderItem={({item}) => (
            <Card style={styles.card}>
              <View style={styles.iconBox}>
                <FileText size={scale(20)} color={colors.primary} />
              </View>
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={8}
                onPress={() => openDocument(item.url)}
                style={styles.downloadBtn}>
                <Download size={scale(20)} color={colors.primary} />
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  searchWrap: {marginBottom: spacing.md},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {flex: 1},
  title: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryText: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  downloadBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DocumentsScreen;

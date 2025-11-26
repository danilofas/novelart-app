import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {novelService} from '../../services/api';
import type {Novel} from '../../types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface NovelCardProps {
  novel: Novel;
  onPress: () => void;
}

const NovelCard: React.FC<NovelCardProps> = ({novel, onPress}) => (
  <TouchableOpacity style={styles.novelCard} onPress={onPress}>
    <Image source={{uri: novel.cover}} style={styles.novelCover} />
    <View style={styles.novelInfo}>
      <Text style={styles.novelTitle} numberOfLines={2}>
        {novel.title}
      </Text>
      <Text style={styles.novelAuthor} numberOfLines={1}>
        {novel.author}
      </Text>
      <View style={styles.novelMeta}>
        <Text style={styles.novelChapters}>{novel.chapterCount} caps</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{novel.rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [popularNovels, setPopularNovels] = useState<Novel[]>([]);
  const [recentNovels, setRecentNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [popular, recent] = await Promise.all([
        novelService.getPopular(1),
        novelService.getRecent(1),
      ]);
      setPopularNovels(popular.data || []);
      setRecentNovels(recent.data || []);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const navigateToNovel = (novelId: string) => {
    navigation.navigate('NovelDetail', {novelId});
  };

  const renderNovelCard = ({item}: {item: Novel}) => (
    <NovelCard novel={item} onPress={() => navigateToNovel(item.id)} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>NovelArt</Text>
              <Text style={styles.headerSubtitle}>
                Descubra histórias incríveis
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Populares</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllButton}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={popularNovels.slice(0, 10)}
                renderItem={renderNovelCard}
                keyExtractor={item => `popular-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Atualizados Recentemente</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllButton}>Ver todos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        data={recentNovels}
        renderItem={renderNovelCard}
        keyExtractor={item => `recent-${item.id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#6c5ce7']}
            tintColor="#6c5ce7"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  novelCard: {
    width: CARD_WIDTH,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  novelCover: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    backgroundColor: '#f0f0f0',
  },
  novelInfo: {
    padding: 10,
  },
  novelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
    height: 36,
  },
  novelAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  novelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  novelChapters: {
    fontSize: 11,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 12,
    color: '#f1c40f',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
  },
});

export default HomeScreen;

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {novelService, libraryService} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import type {Novel, Chapter} from '../../types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../types';

type NovelDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NovelDetail'
>;

type NovelDetailScreenRouteProp = RouteProp<RootStackParamList, 'NovelDetail'>;

interface NovelDetailScreenProps {
  navigation: NovelDetailScreenNavigationProp;
  route: NovelDetailScreenRouteProp;
}

const NovelDetailScreen: React.FC<NovelDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {novelId} = route.params;
  const {isAuthenticated} = useAuth();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const loadNovelData = useCallback(async () => {
    try {
      const [novelData, chaptersData] = await Promise.all([
        novelService.getById(novelId),
        novelService.getChapters(novelId),
      ]);
      setNovel(novelData.data || novelData);
      setChapters(chaptersData.data || []);

      // Check if in library
      if (isAuthenticated) {
        try {
          const libraryData = await libraryService.getLibrary();
          const inLibrary = (libraryData.data || []).some(
            (item: {novel: Novel}) => item.novel.id === novelId,
          );
          setIsInLibrary(inLibrary);
        } catch {
          // Ignore library check errors
        }
      }
    } catch (error) {
      console.error('Error loading novel:', error);
      Alert.alert('Erro', 'Não foi possível carregar a novela.');
    } finally {
      setIsLoading(false);
    }
  }, [novelId, isAuthenticated]);

  useEffect(() => {
    loadNovelData();
  }, [loadNovelData]);

  const handleAddToLibrary = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    try {
      if (isInLibrary) {
        await libraryService.removeFromLibrary(novelId);
        setIsInLibrary(false);
        Alert.alert('Sucesso', 'Novela removida da biblioteca.');
      } else {
        await libraryService.addToLibrary(novelId);
        setIsInLibrary(true);
        Alert.alert('Sucesso', 'Novela adicionada à biblioteca.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a biblioteca.');
    }
  };

  const handleShare = async () => {
    if (!novel) return;
    try {
      await Share.share({
        message: `Confira "${novel.title}" no NovelArt! https://novelart.com.br/novel/${novelId}`,
        title: novel.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartReading = () => {
    if (chapters.length > 0) {
      navigation.navigate('ChapterReader', {
        novelId,
        chapterId: chapters[0].id,
      });
    }
  };

  const handleChapterPress = (chapterId: string) => {
    navigation.navigate('ChapterReader', {novelId, chapterId});
  };

  if (isLoading || !novel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Novel Info */}
        <View style={styles.novelHeader}>
          <Image source={{uri: novel.cover}} style={styles.coverImage} />
          <View style={styles.novelInfo}>
            <Text style={styles.novelTitle}>{novel.title}</Text>
            <Text style={styles.novelAuthor}>{novel.author}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{novel.chapterCount}</Text>
                <Text style={styles.statLabel}>Capítulos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>⭐ {novel.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>{novel.ratingCount} avaliações</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(novel.viewCount / 1000).toFixed(1)}K</Text>
                <Text style={styles.statLabel}>Leituras</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {novel.status === 'completed'
                  ? '✓ Completa'
                  : novel.status === 'ongoing'
                  ? '📝 Em andamento'
                  : '⏸ Em hiato'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.readButton}
            onPress={handleStartReading}>
            <Text style={styles.readButtonText}>Começar a Ler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.libraryButton,
              isInLibrary && styles.libraryButtonActive,
            ]}
            onPress={handleAddToLibrary}>
            <Text
              style={[
                styles.libraryButtonText,
                isInLibrary && styles.libraryButtonTextActive,
              ]}>
              {isInLibrary ? '✓ Na Biblioteca' : '+ Biblioteca'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Synopsis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text
            style={styles.synopsisText}
            numberOfLines={isSynopsisExpanded ? undefined : 4}>
            {novel.synopsis}
          </Text>
          {novel.synopsis.length > 200 && (
            <TouchableOpacity
              onPress={() => setIsSynopsisExpanded(!isSynopsisExpanded)}>
              <Text style={styles.expandText}>
                {isSynopsisExpanded ? 'Mostrar menos' : 'Mostrar mais'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        {novel.tags && novel.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {novel.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chapters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Capítulos ({chapters.length})
          </Text>
          {chapters.slice(0, 20).map(chapter => (
            <TouchableOpacity
              key={chapter.id}
              style={styles.chapterItem}
              onPress={() => handleChapterPress(chapter.id)}>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterNumber}>Cap. {chapter.number}</Text>
                <Text style={styles.chapterTitle} numberOfLines={1}>
                  {chapter.title}
                </Text>
              </View>
              <Text style={styles.chapterDate}>
                {new Date(chapter.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          ))}
          {chapters.length > 20 && (
            <TouchableOpacity style={styles.viewAllChapters}>
              <Text style={styles.viewAllChaptersText}>
                Ver todos os capítulos
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
    color: '#333',
  },
  novelHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  coverImage: {
    width: 140,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  novelInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  novelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  novelAuthor: {
    fontSize: 14,
    color: '#6c5ce7',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  readButton: {
    flex: 2,
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  libraryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  libraryButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  libraryButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  libraryButtonTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  synopsisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  expandText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  chapterInfo: {
    flex: 1,
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: 12,
    color: '#6c5ce7',
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 14,
    color: '#333',
  },
  chapterDate: {
    fontSize: 12,
    color: '#999',
  },
  viewAllChapters: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewAllChaptersText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NovelDetailScreen;

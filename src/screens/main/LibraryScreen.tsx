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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import {libraryService} from '../../services/api';
import type {LibraryItem} from '../../types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types';

type LibraryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Library'
>;

interface LibraryScreenProps {
  navigation: LibraryScreenNavigationProp;
}

const LibraryScreen: React.FC<LibraryScreenProps> = ({navigation}) => {
  const {isAuthenticated} = useAuth();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await libraryService.getLibrary();
      setLibraryItems(response.data || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLibrary();
  };

  const navigateToNovel = (novelId: string) => {
    navigation.navigate('NovelDetail', {novelId});
  };

  const handleRemoveFromLibrary = async (novelId: string) => {
    Alert.alert(
      'Remover da Biblioteca',
      'Deseja remover esta novela da sua biblioteca?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await libraryService.removeFromLibrary(novelId);
              setLibraryItems(prev =>
                prev.filter(item => item.novel.id !== novelId),
              );
            } catch {
              Alert.alert('Erro', 'Não foi possível remover da biblioteca.');
            }
          },
        },
      ],
    );
  };

  const renderLibraryItem = ({item}: {item: LibraryItem}) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => navigateToNovel(item.novel.id)}
      onLongPress={() => handleRemoveFromLibrary(item.novel.id)}>
      <Image source={{uri: item.novel.cover}} style={styles.novelCover} />
      <View style={styles.novelInfo}>
        <Text style={styles.novelTitle} numberOfLines={2}>
          {item.novel.title}
        </Text>
        <Text style={styles.novelAuthor} numberOfLines={1}>
          {item.novel.author}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, {width: `${item.progress}%`}]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
        </View>
        <Text style={styles.lastRead}>
          {item.lastReadAt
            ? `Última leitura: ${new Date(item.lastReadAt).toLocaleDateString('pt-BR')}`
            : 'Ainda não lido'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Biblioteca</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Faça Login</Text>
          <Text style={styles.emptyText}>
            Entre na sua conta para acessar sua biblioteca e salvar suas novelas
            favoritas.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        <Text style={styles.headerSubtitle}>
          {libraryItems.length} {libraryItems.length === 1 ? 'novela' : 'novelas'}
        </Text>
      </View>

      <FlatList
        data={libraryItems}
        renderItem={renderLibraryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#6c5ce7']}
            tintColor="#6c5ce7"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>Biblioteca Vazia</Text>
            <Text style={styles.emptyText}>
              Adicione novelas à sua biblioteca para acompanhar sua leitura.
            </Text>
          </View>
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  libraryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  novelCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  novelInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  novelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  novelAuthor: {
    fontSize: 13,
    color: '#6c5ce7',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  lastRead: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LibraryScreen;

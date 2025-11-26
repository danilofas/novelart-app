import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {chapterService, libraryService} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import type {Chapter} from '../../types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../types';

type ChapterReaderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChapterReader'
>;

type ChapterReaderScreenRouteProp = RouteProp<
  RootStackParamList,
  'ChapterReader'
>;

interface ChapterReaderScreenProps {
  navigation: ChapterReaderScreenNavigationProp;
  route: ChapterReaderScreenRouteProp;
}

type FontSize = 'small' | 'medium' | 'large';
type Theme = 'light' | 'dark' | 'sepia';

interface ReaderSettings {
  fontSize: FontSize;
  theme: Theme;
  lineHeight: number;
}

const fontSizes: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 20,
};

const themes: Record<Theme, {background: string; text: string}> = {
  light: {background: '#ffffff', text: '#333333'},
  dark: {background: '#1a1a2e', text: '#e0e0e0'},
  sepia: {background: '#f5e6d3', text: '#5c4a32'},
};

const ChapterReaderScreen: React.FC<ChapterReaderScreenProps> = ({
  navigation,
  route,
}) => {
  const {novelId, chapterId} = route.params;
  const {isAuthenticated} = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 'medium',
    theme: 'light',
    lineHeight: 1.8,
  });

  const loadChapter = useCallback(async () => {
    try {
      const [chapterData, contentData] = await Promise.all([
        chapterService.getById(chapterId),
        chapterService.getContent(chapterId),
      ]);
      setChapter(chapterData.data || chapterData);
      setContent(contentData.data?.content || contentData.content || '');

      // Update reading progress
      if (isAuthenticated) {
        try {
          await libraryService.updateReadingProgress(novelId, chapterId);
        } catch {
          // Ignore progress update errors
        }
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, novelId, isAuthenticated]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  const changeFontSize = (size: FontSize) => {
    setSettings(prev => ({...prev, fontSize: size}));
  };

  const changeTheme = (theme: Theme) => {
    setSettings(prev => ({...prev, theme}));
  };

  const currentTheme = themes[settings.theme];

  if (isLoading || !chapter) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: currentTheme.background}]}
      edges={['top']}>
      {/* Header */}
      <View
        style={[styles.header, {backgroundColor: currentTheme.background}]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButtonText, {color: currentTheme.text}]}>
            ←
          </Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text
            style={[styles.chapterTitle, {color: currentTheme.text}]}
            numberOfLines={1}>
            Capítulo {chapter.number}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSettings(!showSettings)}>
          <Text style={[styles.headerButtonText, {color: currentTheme.text}]}>
            Aa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View
          style={[
            styles.settingsPanel,
            {backgroundColor: currentTheme.background},
          ]}>
          <Text style={[styles.settingLabel, {color: currentTheme.text}]}>
            Tamanho da Fonte
          </Text>
          <View style={styles.fontSizeButtons}>
            {(['small', 'medium', 'large'] as FontSize[]).map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontSizeButton,
                  settings.fontSize === size && styles.fontSizeButtonActive,
                ]}
                onPress={() => changeFontSize(size)}>
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    {fontSize: fontSizes[size] - 4},
                    settings.fontSize === size &&
                      styles.fontSizeButtonTextActive,
                  ]}>
                  A
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.settingLabel,
              styles.settingLabelMargin,
              {color: currentTheme.text},
            ]}>
            Tema
          </Text>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'sepia'] as Theme[]).map(theme => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeButton,
                  {backgroundColor: themes[theme].background},
                  settings.theme === theme && styles.themeButtonActive,
                ]}
                onPress={() => changeTheme(theme)}>
                <Text style={{color: themes[theme].text}}>
                  {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '📜'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.chapterName, {color: currentTheme.text}]}>
          {chapter.title}
        </Text>
        <Text
          style={[
            styles.contentText,
            {
              color: currentTheme.text,
              fontSize: fontSizes[settings.fontSize],
              lineHeight: fontSizes[settings.fontSize] * settings.lineHeight,
            },
          ]}>
          {content}
        </Text>
      </ScrollView>

      {/* Footer Navigation */}
      <View
        style={[styles.footer, {backgroundColor: currentTheme.background}]}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={[styles.navButtonText, {color: currentTheme.text}]}>
            ← Anterior
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chaptersButton}
          onPress={() => navigation.navigate('NovelDetail', {novelId})}>
          <Text style={styles.chaptersButtonText}>≡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={[styles.navButtonText, {color: currentTheme.text}]}>
            Próximo →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsPanel: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingLabelMargin: {
    marginTop: 16,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  fontSizeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  fontSizeButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  fontSizeButtonTextActive: {
    color: '#fff',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonActive: {
    borderColor: '#6c5ce7',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  chapterName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  contentText: {
    textAlign: 'justify',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chaptersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  chaptersButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default ChapterReaderScreen;

// src/screens/ProfileScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, FlatList
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('ProfileScreen: Token encontrado:', userToken ? 'SIM' : 'NÃO');
      
      if (!userToken) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        signOut();
        return;
      }

      console.log('ProfileScreen: Fazendo requisição para /users/me...');
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('ProfileScreen: Resposta /users/me:', userResponse.data);
      setUser(userResponse.data);

      console.log('ProfileScreen: Fazendo requisição para /users/me/posts...');
      const myPostsResponse = await api.get('/users/me/posts', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('ProfileScreen: Resposta /users/me/posts:', myPostsResponse.data);
      setMyPosts(myPostsResponse.data);

      console.log('ProfileScreen: Fazendo requisição para /users/me/favorites...');
      const favoritePostsResponse = await api.get('/users/me/favorites', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('ProfileScreen: Resposta /users/me/favorites:', favoritePostsResponse.data);
      setFavoritePosts(favoritePostsResponse.data);

    } catch (error) {
      console.error('ProfileScreen: Erro ao carregar perfil:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      showActions={false}
      style={styles.profilePostCard}
    />
  );

  if (loading) {
    return <LoadingSpinner message="Carregando perfil..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="person-circle-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.errorText}>Perfil não encontrado.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { user })} style={styles.editButton}>
          <View style={styles.editButtonGradient}>
            <Ionicons name="settings-outline" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {/* Informações do Usuário */}
        <View style={styles.profileInfoCard}>
          <View style={styles.profileCardGradient}>
            {user.profile_picture_url ? (
              <Image 
                source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture_url}` }} 
                style={styles.profilePicture} 
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={50} color="white" />
              </View>
            )}
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.memberSinceContainer}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.memberSince}>
                Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Abas de Navegação */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsGradient}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'myPosts' && styles.activeTab]}
              onPress={() => setActiveTab('myPosts')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'myPosts' ? theme.colors.primary : theme.colors.text.secondary} 
              />
              <Text style={[styles.tabText, activeTab === 'myPosts' && styles.activeTabText]}>
                Meus Posts ({myPosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'favorites' && styles.activeTab]}
              onPress={() => setActiveTab('favorites')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="star-outline" 
                size={20} 
                color={activeTab === 'favorites' ? theme.colors.primary : theme.colors.text.secondary} 
              />
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                Favoritos ({favoritePosts.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'myPosts' ? (
          myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              scrollEnabled={false}
              contentContainerStyle={styles.postListContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="document-text-outline" size={48} color="white" />
                </View>
                <Text style={styles.emptyStateText}>Você ainda não criou nenhum post</Text>
                <Text style={styles.emptyStateSubtext}>
                  Compartilhe suas ideias com a comunidade!
                </Text>
                <Button 
                  title="Criar Primeiro Post" 
                  onPress={() => navigation.navigate('Home')}
                  style={styles.emptyStateButton}
                />
              </View>
            </View>
          )
        ) : (
          favoritePosts.length > 0 ? (
            <FlatList
              data={favoritePosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              scrollEnabled={false}
              contentContainerStyle={styles.postListContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="star-outline" size={48} color="white" />
                </View>
                <Text style={styles.emptyStateText}>Você ainda não favoritou nenhum post</Text>
                <Text style={styles.emptyStateSubtext}>
                  Explore posts interessantes e salve-os aqui!
                </Text>
                <Button 
                  title="Explorar Posts" 
                  onPress={() => navigation.navigate('Home')}
                  style={styles.emptyStateButton}
                />
              </View>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.large,
  },
  
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  
  backButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  
  backButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    ...theme.shadows.medium,
  },
  
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  editButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  
  editButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  
  scrollViewContent: {
    paddingBottom: theme.spacing.lg,
  },
  
  profileInfoCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  profileCardGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  
  username: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  
  email: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  memberSince: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  
  tabsContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  tabsGradient: {
    flexDirection: 'row',
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  
  activeTab: {
    backgroundColor: theme.colors.primary + '20',
  },
  
  tabText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
  
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  postListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  
  profilePostCard: {
    marginBottom: theme.spacing.md,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  
  emptyStateCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.large,
  },
  
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
  },
  
  emptyStateText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  emptyStateSubtext: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  emptyStateButton: {
    minWidth: 200,
  },
});

export default ProfileScreen;


import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { theme } from '../theme/theme';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { userToken, signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    favorites: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (!userToken) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        signOut();
        return;
      }

      const [userResponse, postsResponse, favoritesResponse] = await Promise.all([
        api.get('/users/me', { headers: { Authorization: `Bearer ${userToken}` } }),
        api.get('/users/me/posts', { headers: { Authorization: `Bearer ${userToken}` } }),
        api.get('/users/me/favorites', { headers: { Authorization: `Bearer ${userToken}` } }),
      ]);

      setUser(userResponse.data);
      setUserPosts(postsResponse.data);
      setFavoritePosts(favoritesResponse.data);
      
      setStats({
        posts: postsResponse.data.length,
        likes: postsResponse.data.reduce((acc, post) => acc + (post.likes_count || 0), 0),
        favorites: favoritesResponse.data.length,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const renderStatCard = (icon, value, label, colors) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={colors}
        style={styles.statGradient}
      >
        <Ionicons name={icon} size={24} color={theme.colors.text.primary} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Carregando perfil..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.gradients.dark}
        style={styles.background}
      >
        {/* Header Fixo */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <LinearGradient
              colors={theme.colors.gradients.glass}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Perfil</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile', { user })}
              style={styles.headerButton}
            >
              <LinearGradient
                colors={theme.colors.gradients.glass}
                style={styles.headerButtonGradient}
              >
                <Ionicons name="create" size={20} color={theme.colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <LinearGradient
                colors={theme.colors.gradients.glass}
                style={styles.headerButtonGradient}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Seção do Perfil */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={theme.colors.gradients.surface}
              style={styles.profileCard}
            >
              <View style={styles.profileContent}>
                {user?.profile_picture_url ? (
                  <Image
                    source={{ uri: user.profile_picture_url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    style={styles.profileImagePlaceholder}
                  >
                    <Ionicons name="person" size={48} color={theme.colors.text.primary} />
                  </LinearGradient>
                )}
                
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{user?.username}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            {renderStatCard('document-text', stats.posts, 'Posts', theme.colors.gradients.primary)}
            {renderStatCard('heart', stats.likes, 'Likes', theme.colors.gradients.accent)}
            {renderStatCard('star', stats.favorites, 'Favoritos', theme.colors.gradients.secondary)}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <LinearGradient
                colors={activeTab === 'posts' ? theme.colors.gradients.primary : theme.colors.gradients.glass}
                style={styles.tabGradient}
              >
                <Ionicons 
                  name="document-text" 
                  size={20} 
                  color={theme.colors.text.primary} 
                />
                <Text style={styles.tabText}>Meus Posts</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
              onPress={() => setActiveTab('favorites')}
            >
              <LinearGradient
                colors={activeTab === 'favorites' ? theme.colors.gradients.secondary : theme.colors.gradients.glass}
                style={styles.tabGradient}
              >
                <Ionicons 
                  name="star" 
                  size={20} 
                  color={theme.colors.text.primary} 
                />
                <Text style={styles.tabText}>Favoritos</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View style={styles.contentContainer}>
            {activeTab === 'posts' ? (
              userPosts.length > 0 ? (
                <View style={styles.postsList}>
                  {userPosts.map((post) => (
                    <View key={post.id} style={styles.postItem}>
                      <PostCard
                        post={post}
                        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                        onLike={() => {}}
                        onFavorite={() => {}}
                        onComment={() => {}}
                        isLiked={false}
                        isFavorited={false}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <LinearGradient
                    colors={theme.colors.gradients.glass}
                    style={styles.emptyGradient}
                  >
                    <Ionicons name="document-text-outline" size={64} color={theme.colors.text.secondary} />
                    <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
                    <Text style={styles.emptyText}>
                      Comece a compartilhar suas ideias criando seu primeiro post!
                    </Text>
                    <Button
                      title="Criar Primeiro Post"
                      onPress={() => navigation.navigate('Home')}
                      style={styles.emptyButton}
                    />
                  </LinearGradient>
                </View>
              )
            ) : (
              favoritePosts.length > 0 ? (
                <View style={styles.postsList}>
                  {favoritePosts.map((post) => (
                    <View key={post.id} style={styles.postItem}>
                      <PostCard
                        post={post}
                        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                        onLike={() => {}}
                        onFavorite={() => {}}
                        onComment={() => {}}
                        isLiked={false}
                        isFavorited={true}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <LinearGradient
                    colors={theme.colors.gradients.glass}
                    style={styles.emptyGradient}
                  >
                    <Ionicons name="star-outline" size={64} color={theme.colors.text.secondary} />
                    <Text style={styles.emptyTitle}>Nenhum favorito</Text>
                    <Text style={styles.emptyText}>
                      Posts que você favoritar aparecerão aqui!
                    </Text>
                    <Button
                      title="Explorar Posts"
                      onPress={() => navigation.navigate('Home')}
                      style={styles.emptyButton}
                    />
                  </LinearGradient>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  background: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  backButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  backButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  headerTitle: {
    ...theme.typography.h5,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  headerActions: {
    flexDirection: 'row',
  },
  
  headerButton: {
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  headerButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  scrollView: {
    flex: 1,
  },
  
  profileSection: {
    padding: theme.spacing.lg,
  },
  
  profileCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.large,
  },
  
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  userInfo: {
    flex: 1,
  },
  
  username: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
  },
  
  userEmail: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  statGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  
  statValue: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    fontWeight: '700',
  },
  
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  tab: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  activeTab: {
    ...theme.shadows.glow,
  },
  
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  
  tabText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  
  postsList: {
    gap: theme.spacing.lg,
  },
  
  postItem: {
    marginBottom: theme.spacing.lg,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyGradient: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  emptyTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  emptyButton: {
    minWidth: 200,
  },
});

export default ProfileScreen;
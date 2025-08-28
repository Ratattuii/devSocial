// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, Alert,
  FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newPostImageUri, setNewPostImageUri] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          const userResponse = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          setCurrentUser(userResponse.data);
          setCurrentUserId(userResponse.data.id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    
    loadUserData();
    fetchPosts();

    // Pedir permissão para acessar a galeria de imagens
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
      }
    })();
  }, [searchTerm]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await api.get(`/posts?q=${searchTerm}`);

      // Buscar likes e favoritos do usuário
      let initialUserLikes = {};
      let initialUserFavorites = {};
      
      if (currentUserId) {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          const [likesResponse, favoritesResponse] = await Promise.all([
            api.get(`/users/${currentUserId}/likes`, {
              headers: { Authorization: `Bearer ${userToken}` }
            }),
            api.get(`/users/${currentUserId}/favorites`, {
              headers: { Authorization: `Bearer ${userToken}` }
            })
          ]);
          
          likesResponse.data.forEach(like => {
            initialUserLikes[like.post_id] = true;
          });
          
          favoritesResponse.data.forEach(favorite => {
            initialUserFavorites[favorite.post_id] = true;
          });
        } catch (error) {
          console.error('Erro ao buscar interações do usuário:', error.response?.data || error.message);
        }
      }
      
      setUserLikes(initialUserLikes);
      setUserFavorites(initialUserFavorites);
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os posts.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const pickPostImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Ajuste conforme preferir
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPostImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo do post não podem ser vazios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para criar um post.');
        signOut();
        return;
      }

      let imageUrlToSave = null;
      if (newPostImageUri) {
        // Faça o upload da imagem do post primeiro
        const formData = new FormData();
        formData.append('postImage', {
          uri: newPostImageUri,
          name: `post_${currentUserId}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });

        try {
          const uploadResponse = await api.post('/upload/post-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
          });
          imageUrlToSave = uploadResponse.data.imageUrl; // URL retornada pelo backend
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem do post:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da imagem do post.');
          setIsSubmitting(false);
          return;
        }
      }

      await api.post(
        '/posts',
        { title: newPostTitle, content: newPostContent, image_url: imageUrlToSave }, // Envia a URL da imagem
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert('Sucesso', 'Post criado com sucesso!');
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUri(null); // Limpa a imagem selecionada
      fetchPosts(); // Recarrega os posts
    } catch (error) {
      console.error('Erro ao criar post:', error.response?.data || error.message);
      Alert.alert('Erro ao Criar Post', error.response?.data?.message || 'Ocorreu um erro ao criar o post.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro', 'Você precisa estar logado para curtir posts.');
        signOut();
        return;
      }
      const response = await api.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const liked = response.data.liked;
      setUserLikes(prevLikes => ({
        ...prevLikes,
        [postId]: liked,
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes_count: liked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1) }
            : post
        )
      );

    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o like.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    }
  };

  const handleToggleFavorite = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro', 'Você precisa estar logado para favoritar posts.');
        signOut();
        return;
      }
      
      const response = await api.post(
        `/posts/${postId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const favorited = response.data.favorited;
      setUserFavorites(prevFavorites => ({
        ...prevFavorites,
        [postId]: favorited,
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, favorites_count: favorited ? (post.favorites_count || 0) + 1 : Math.max(0, (post.favorites_count || 0) - 1) }
            : post
        )
      );

    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o favorito.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    }
  };

  const handleLogout = () => {
    console.log('HomeScreen: Botão Sair pressionado!');
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: async () => {
        console.log('HomeScreen: Confirmando logout...');
        try {
          await signOut();
          console.log('HomeScreen: Logout realizado com sucesso!');
        } catch (error) {
          console.error('HomeScreen: Erro no logout:', error);
        }
      }}
    ]);
  };

  const handleEditPost = (post) => {
    // Implementar edição de post
    Alert.alert('Funcionalidade', 'Edição de posts será implementada em breve!');
  };

  const handleDeletePost = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      Alert.alert('Sucesso', 'Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível excluir o post.');
    }
  };

  const renderPostItem = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      onLike={handleToggleLike}
      onFavorite={handleToggleFavorite}
      onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
      onEdit={item.user_id === currentUserId ? handleEditPost : null}
      onDelete={item.user_id === currentUserId ? handleDeletePost : null}
      isLiked={userLikes[item.id] || false}
      isFavorited={userFavorites[item.id] || false}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Fórum Social</Text>
          {currentUser && (
            <Text style={styles.subtitle}>Olá, {currentUser.username}!</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')} 
            style={styles.profileButton}
          >
            <Ionicons name="person-circle" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
          <Button 
            title="Sair" 
            variant="outline" 
            size="small" 
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Pesquisar posts..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
          <Button 
            title="Buscar" 
            size="small" 
            onPress={fetchPosts}
            style={styles.searchButton}
          />
        </View>

        {/* Botão para criar novo post */}
        <Button
          title={showCreatePost ? "Cancelar" : "Criar Novo Post"}
          variant={showCreatePost ? "outline" : "primary"}
          onPress={() => setShowCreatePost(!showCreatePost)}
          style={styles.createPostToggle}
        />

        {/* Formulário de criação de post */}
        {showCreatePost && (
          <View style={styles.createPostForm}>
            <Input
              label="Título"
              placeholder="Título do seu post"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            
            <Input
              label="Conteúdo"
              placeholder="O que você quer compartilhar?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.imageSection}>
              <Button
                title="Adicionar Imagem"
                variant="outline"
                size="small"
                onPress={pickPostImage}
                style={styles.imageButton}
              />
              {newPostImageUri && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: newPostImageUri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    onPress={() => setNewPostImageUri(null)}
                    style={styles.removeImageButton}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <Button
              title="Publicar Post"
              loading={isSubmitting}
              disabled={!newPostTitle.trim() || !newPostContent.trim()}
              onPress={handleCreatePost}
            />
          </View>
        )}

        {/* Lista de Posts */}
        {loadingPosts ? (
          <LoadingSpinner message="Carregando posts..." />
        ) : (
          <View style={styles.postsContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.text.secondary} />
                <Text style={styles.emptyText}>Nenhum post encontrado</Text>
                <Text style={styles.emptySubtext}>
                  Tente ajustar sua pesquisa ou seja o primeiro a postar!
                </Text>
              </View>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                  onLike={handleToggleLike}
                  onFavorite={handleToggleFavorite}
                  onComment={() => navigation.navigate('PostDetail', { postId: post.id })}
                  onEdit={post.user_id === currentUserId ? handleEditPost : null}
                  onDelete={post.user_id === currentUserId ? handleDeletePost : null}
                  isLiked={userLikes[post.id] || false}
                  isFavorited={userFavorites[post.id] || false}
                />
              ))
            )}
          </View>
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.small,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  profileButton: {
    marginRight: theme.spacing.md,
  },
  
  logoutButton: {
    marginLeft: theme.spacing.sm,
  },
  
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  searchInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  
  searchButton: {
    minWidth: 80,
  },
  
  createPostToggle: {
    marginBottom: theme.spacing.lg,
  },
  
  createPostForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  
  imageSection: {
    marginBottom: theme.spacing.lg,
  },
  
  imageButton: {
    marginBottom: theme.spacing.sm,
  },
  
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
  },
  

  
  postsContainer: {
    flex: 1,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});

export default HomeScreen;
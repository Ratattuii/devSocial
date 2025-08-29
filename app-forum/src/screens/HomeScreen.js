

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { theme } from '../theme/theme';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { userToken, signOut, user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUri, setNewPostImageUri] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);


  useEffect(() => {
    fetchPosts();
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria.');
      }
    })();
  }, []);

    const handleLogout = () => {
    console.log('HomeScreen: handleLogout chamado');
    console.log('HomeScreen: signOut disponível:', !!signOut);
    console.log('HomeScreen: Executando logout diretamente...');
    signOut();
  };

  const fetchPosts = async () => {
    try {
      console.log('Buscando posts...');
      const response = await api.get(`/posts?q=${searchTerm}`);
      console.log('Posts recebidos:', response.data);
      
      let initialUserLikes = {};
      let initialUserFavorites = {};

      if (userToken) {
        try {
          console.log('Buscando interações do usuário...');
          const [likesResponse, favoritesResponse] = await Promise.all([
            api.get('/users/me/likes', { headers: { Authorization: `Bearer ${userToken}` } }),
            api.get('/users/me/favorites', { headers: { Authorization: `Bearer ${userToken}` } }),
          ]);

          console.log('Likes recebidos:', likesResponse.data);
          console.log('Favoritos recebidos:', favoritesResponse.data);

          likesResponse.data.forEach(like => {
            initialUserLikes[like.post_id] = true;
          });

          favoritesResponse.data.forEach(favorite => {
            if (favorite.post_id) {
              initialUserFavorites[favorite.post_id] = true;
              console.log('Post favoritado encontrado:', favorite.post_id);
            } else {
              console.log('Favorito com post_id undefined:', favorite);
            }
          });
        } catch (error) {
          console.log('Erro ao buscar interações do usuário:', error);
        }
      }

      setPosts(response.data);
      setUserLikes(initialUserLikes);
      setUserFavorites(initialUserFavorites);
      console.log('Estado inicial dos favoritos:', initialUserFavorites);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      Alert.alert('Erro', 'Não foi possível carregar os posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId) => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para curtir posts.');
      return;
    }

    try {
      await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      setUserLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const currentCount = post.likes_count || 0;
          const newCount = userLikes[postId] ? currentCount - 1 : currentCount + 1;
          return { ...post, likes_count: newCount };
        }
        return post;
      }));
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleFavorite = async (postId) => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para favoritar posts.');
      return;
    }

    try {
      console.log('Favoritando post:', postId);
      console.log('Estado atual do favorito:', userFavorites[postId]);
      
      await api.post(`/posts/${postId}/favorite`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      
      const isCurrentlyFavorited = userFavorites[postId] || false;
      const newFavoriteState = !isCurrentlyFavorited;
      
      console.log('Novo estado do favorito:', newFavoriteState);
      
      setUserFavorites(prev => ({ ...prev, [postId]: newFavoriteState }));
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const currentCount = post.favorites_count || 0;
          const newCount = isCurrentlyFavorited ? currentCount - 1 : currentCount + 1;
          console.log('Count atual:', currentCount, 'Novo count de favoritos:', newCount);
          return { ...post, favorites_count: newCount };
        }
        return post;
      }));
    } catch (error) {
      console.error('Erro ao favoritar post:', error);
    }
  };

  const handleComment = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleEditPost = (post) => {
    navigation.navigate('EditPost', { post });
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Excluir Post',
      'Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => confirmDeletePost(postId) },
      ]
    );
  };

  const confirmDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setPosts(posts.filter(post => post.id !== postId));
      Alert.alert('Sucesso', 'Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível excluir o post.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPostImageUri(result.assets[0].uri);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios.');
      return;
    }

    setCreatingPost(true);
    try {
      let imageUrlToSave = null;
      if (newPostImageUri) {
        const formData = new FormData();
        formData.append('postImage', {
          uri: newPostImageUri,
          type: 'image/jpeg',
          name: 'post-image.jpg',
        });

        try {
          const uploadResponse = await api.post('/upload/post-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userToken}`,
            },
          });
          imageUrlToSave = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem do post:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro', 'Não foi possível fazer upload da imagem. O post será criado sem imagem.');
        }
      }

      await api.post(
        '/posts',
        { title: newPostTitle, content: newPostContent, image_url: imageUrlToSave },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUri(null);
      setShowCreateModal(false);
      fetchPosts();
      Alert.alert('Sucesso', 'Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível criar o post. Tente novamente.');
    } finally {
      setCreatingPost(false);
    }
  };

  const renderPost = ({ item, index }) => (
    <View style={styles.postContainer}>
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        onLike={handleLike}
        onFavorite={handleFavorite}
        onComment={handleComment}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        isLiked={userLikes[item.id]}
        isFavorited={userFavorites[item.id]}
        currentUserId={user?.id}
      />
    </View>
  );



  if (loading) {
    return <LoadingSpinner message="Carregando posts..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.gradients.dark}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerButton}>
            <LinearGradient
              colors={theme.colors.gradients.glass}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="person" size={24} color={theme.colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar posts..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={fetchPosts}
            />
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(true)} 
              style={styles.headerButton}
            >
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={styles.headerButtonGradient}
              >
                <Ionicons name="add" size={24} color={theme.colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => {
              console.log('HomeScreen: Botão logout clicado');
              handleLogout();
            }} style={styles.headerButton}>
              <LinearGradient
                colors={theme.colors.gradients.glass}
                style={styles.headerButtonGradient}
              >
                <Ionicons name="log-out-outline" size={24} color={theme.colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsList}
            onRefresh={fetchPosts}
            refreshing={refreshing}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={theme.colors.gradients.glass}
              style={styles.emptyGradient}
            >
              <Ionicons name="document-text-outline" size={64} color={theme.colors.text.secondary} />
              <Text style={styles.emptyTitle}>Nenhum post encontrado</Text>
              <Text style={styles.emptyText}>
                {searchTerm ? 'Tente ajustar sua pesquisa ou seja o primeiro a postar!' : 'Seja o primeiro a criar um post!'}
              </Text>
              <Button
                title="Criar Primeiro Post"
                onPress={() => setShowCreateModal(true)}
                style={styles.emptyButton}
              />
            </LinearGradient>
          </View>
        )}
      </LinearGradient>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={theme.colors.gradients.dark}
            style={styles.modalBackground}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Novo Post</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Título do post"
                placeholderTextColor={theme.colors.text.tertiary}
                value={newPostTitle}
                onChangeText={setNewPostTitle}
              />
              
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Conteúdo do post..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={6}
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

              <View style={styles.modalActions}>
                <Button
                  title="Adicionar Imagem"
                  onPress={pickImage}
                  variant="outline"
                  style={styles.modalButton}
                />
                
                <Button
                  title="Criar Post"
                  onPress={createPost}
                  loading={creatingPost}
                  disabled={creatingPost}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>


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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  headerButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginLeft: theme.spacing.sm,
  },
  
  headerButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    color: theme.colors.text.primary,
    ...theme.typography.body,
  },
  
  createButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  createButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  postsList: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  
  postContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
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
  

  
  modalContainer: {
    flex: 1,
  },
  
  modalBackground: {
    flex: 1,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  modalTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  modalTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  imagePreview: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },
  
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.borderRadius.round,
  },
  
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  

});

export default HomeScreen;
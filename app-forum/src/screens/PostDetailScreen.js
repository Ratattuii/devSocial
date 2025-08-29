import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { userToken } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`),
      ]);

      setPost(postResponse.data);
      setComments(commentsResponse.data);

      if (userToken) {
        try {
          const [likesResponse, favoritesResponse] = await Promise.all([
            api.get('/users/me/likes', { headers: { Authorization: `Bearer ${userToken}` } }),
            api.get('/users/me/favorites', { headers: { Authorization: `Bearer ${userToken}` } }),
          ]);

          setIsLiked(likesResponse.data.some(like => like.post_id === postId));
          setIsFavorited(favoritesResponse.data.some(fav => fav.post_id === postId));
        } catch (error) {
          console.log('Erro ao buscar interações do usuário:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do post:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do post.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para curtir posts.');
      return;
    }

    try {
      await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setPost(prev => ({
        ...prev,
        likes_count: wasLiked ? (prev.likes_count || 0) - 1 : (prev.likes_count || 0) + 1,
      }));
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleFavorite = async () => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para favoritar posts.');
      return;
    }

    try {
      await api.post(`/posts/${postId}/favorite`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      const wasFavorited = isFavorited;
      setIsFavorited(!wasFavorited);
      setPost(prev => ({
        ...prev,
        favorites_count: wasFavorited ? (prev.favorites_count || 0) - 1 : (prev.favorites_count || 0) + 1,
      }));
    } catch (error) {
      console.error('Erro ao favoritar post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Erro', 'Digite um comentário antes de enviar.');
      return;
    }

    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para comentar.');
      return;
    }

    setSubmittingComment(true);
    try {
      console.log('Enviando comentário:', commentText);
      const response = await api.post(
        `/posts/${postId}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      console.log('Comentário enviado:', response.data);
      
      // Buscar comentários atualizados
      const commentsResponse = await api.get(`/posts/${postId}/comments`);
      setComments(commentsResponse.data);
      
      setCommentText('');
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1,
      }));
    } catch (error) {
      console.error('Erro ao comentar:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <LoadingSpinner message="Carregando post..." />;
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.gradients.dark}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <LinearGradient
              colors={theme.colors.gradients.glass}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Post</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <LinearGradient
                colors={isLiked ? theme.colors.gradients.accent : theme.colors.gradients.glass}
                style={styles.actionButtonGradient}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={theme.colors.text.primary} 
                />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleFavorite} style={styles.actionButton}>
              <LinearGradient
                colors={isFavorited ? theme.colors.gradients.secondary : theme.colors.gradients.glass}
                style={styles.actionButtonGradient}
              >
                <Ionicons 
                  name={isFavorited ? "star" : "star-outline"} 
                  size={20} 
                  color={theme.colors.text.primary} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.postContainer}>
              <LinearGradient
                colors={theme.colors.gradients.surface}
                style={styles.postCard}
              >
                <View style={styles.postHeader}>
                  {post.user?.profile_picture_url ? (
                    <Image
                      source={{ uri: post.user.profile_picture_url }}
                      style={styles.authorAvatar}
                    />
                  ) : (
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={styles.authorAvatarPlaceholder}
                    >
                      <Ionicons name="person" size={24} color={theme.colors.text.primary} />
                    </LinearGradient>
                  )}
                  
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.user?.username}</Text>
                    <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent}>{post.content}</Text>

                {post.image_url && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: post.image_url }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="heart" size={16} color={theme.colors.accent} />
                    <Text style={styles.statText}>{post.likes_count || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble" size={16} color={theme.colors.secondary} />
                    <Text style={styles.statText}>{post.comments_count || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color={theme.colors.warning} />
                    <Text style={styles.statText}>{post.favorites_count || 0}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comentários ({comments.length})
              </Text>
              
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <View key={comment.id} style={styles.commentContainer}>
                    <LinearGradient
                      colors={theme.colors.gradients.glass}
                      style={styles.commentCard}
                    >
                      <View style={styles.commentHeader}>
                        {comment.user?.profile_picture_url ? (
                          <Image
                            source={{ uri: comment.user.profile_picture_url }}
                            style={styles.commentAvatar}
                          />
                        ) : (
                          <LinearGradient
                            colors={theme.colors.gradients.secondary}
                            style={styles.commentAvatarPlaceholder}
                          >
                            <Ionicons name="person" size={16} color={theme.colors.text.primary} />
                          </LinearGradient>
                        )}
                        
                        <View style={styles.commentInfo}>
                          <Text style={styles.commentAuthor}>{comment.user?.username}</Text>
                          <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </LinearGradient>
                  </View>
                ))
              ) : (
                <View style={styles.emptyComments}>
                  <LinearGradient
                    colors={theme.colors.gradients.glass}
                    style={styles.emptyCommentsGradient}
                  >
                    <Ionicons name="chatbubble-outline" size={48} color={theme.colors.text.secondary} />
                    <Text style={styles.emptyCommentsText}>
                      Seja o primeiro a comentar!
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <LinearGradient
              colors={theme.colors.gradients.surface}
              style={styles.commentInputCard}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Adicione um comentário..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity
                onPress={handleComment}
                disabled={submittingComment || !commentText.trim()}
                style={styles.sendButton}
              >
                <LinearGradient
                  colors={commentText.trim() ? theme.colors.gradients.primary : theme.colors.gradients.glass}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={theme.colors.text.primary} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
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
  
  actionButton: {
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  actionButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  content: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  postContainer: {
    padding: theme.spacing.lg,
  },
  
  postCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.large,
  },
  
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
  },
  
  authorAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  authorInfo: {
    flex: 1,
  },
  
  authorName: {
    ...theme.typography.h6,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  postDate: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  
  postTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '700',
  },
  
  postContent: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  
  imageContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  
  postImage: {
    width: '100%',
    height: 200,
  },
  
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  
  commentsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  
  commentsTitle: {
    ...theme.typography.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    fontWeight: '600',
  },
  
  commentContainer: {
    marginBottom: theme.spacing.md,
  },
  
  commentCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
  },
  
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  commentInfo: {
    flex: 1,
  },
  
  commentAuthor: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  
  commentDate: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  
  commentContent: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  
  emptyComments: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyCommentsGradient: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  emptyCommentsText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  
  commentInputContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  
  commentInputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.primary,
    ...theme.typography.body,
    textAlignVertical: 'top',
  },
  
  sendButton: {
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  
  sendButtonGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  errorText: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
});

export default PostDetailScreen;
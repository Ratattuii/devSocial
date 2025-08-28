import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, FlatList
} from 'react-native';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { signOut } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postResponse = await api.get(`/posts/${postId}`);
      setPost(postResponse.data);

      const commentsResponse = await api.get(`/comments/${postId}`);
      setComments(commentsResponse.data);

    } catch (error) {
      console.error('Erro ao buscar detalhes do post/comentários:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do post.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) {
      Alert.alert('Erro', 'O comentário não pode ser vazio.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para comentar.');
        signOut();
        return;
      }

      await api.post(
        `/comments/${postId}`,
        { content: newCommentContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert('Sucesso', 'Comentário adicionado!');
      setNewCommentContent('');
      fetchPostAndComments();
    } catch (error) {
      console.error('Erro ao criar comentário:', error.response?.data || error.message);
      Alert.alert('Erro ao Comentar', error.response?.data?.message || 'Ocorreu um erro ao adicionar o comentário.');
      if (error.response?.status === 401 || error.response?.status === 403) {
         signOut();
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando post..." />;
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.errorText}>Post não encontrado.</Text>
        </View>
      </View>
    );
  }

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentCardGradient}>
        <View style={styles.commentHeader}>
          {item.profile_picture_url ? (
            <Image 
              source={{ uri: `http://localhost:3001${item.profile_picture_url}` }} 
              style={styles.commentProfilePicture} 
            />
          ) : (
            <View style={styles.commentProfilePicturePlaceholder}>
              <Ionicons name="person" size={20} color="white" />
            </View>
          )}
          <View style={styles.commentInfo}>
            <Text style={styles.commentUsername}>{item.username}</Text>
            <Text style={styles.commentDate}>
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {/* Post Principal */}
        <View style={styles.postCard}>
          <View style={styles.postCardGradient}>
            <View style={styles.postHeader}>
              {post.user?.profile_picture_url ? (
                <Image 
                  source={{ uri: `http://localhost:3001${post.user.profile_picture_url}` }} 
                  style={styles.postProfilePicture} 
                />
              ) : (
                <View style={styles.postProfilePicturePlaceholder}>
                  <Ionicons name="person" size={30} color="white" />
                </View>
              )}
              <View style={styles.postInfo}>
                <Text style={styles.postUsername}>{post.user?.username || 'Usuário'}</Text>
                <Text style={styles.postDate}>
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
            
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            
            {post.image_url && (
              <View style={styles.postImageContainer}>
                <Image 
                  source={{ uri: `http://localhost:3001${post.image_url}` }} 
                  style={styles.postImage} 
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color={theme.colors.primary} />
                <Text style={styles.statText}>{post.likes_count || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color={theme.colors.accent} />
                <Text style={styles.statText}>{post.favorites_count || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color={theme.colors.secondary} />
                <Text style={styles.statText}>{comments.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seção de Comentários */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <View style={styles.commentsHeaderGradient}>
              <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.commentsTitle}>Comentários ({comments.length})</Text>
            </View>
          </View>

          {/* Formulário de Novo Comentário */}
          <View style={styles.commentForm}>
            <View style={styles.commentFormGradient}>
              <Input
                placeholder="Adicione um comentário..."
                value={newCommentContent}
                onChangeText={setNewCommentContent}
                multiline
                numberOfLines={3}
                style={styles.commentInput}
              />
              <Button
                title={isSubmittingComment ? "Enviando..." : "Comentar"}
                onPress={handleCreateComment}
                disabled={isSubmittingComment || !newCommentContent.trim()}
                style={styles.commentButton}
              />
            </View>
          </View>

          {/* Lista de Comentários */}
          {comments.length > 0 ? (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              contentContainerStyle={styles.commentsList}
            />
          ) : (
            <View style={styles.emptyComments}>
              <View style={styles.emptyCommentsCard}>
                <View style={styles.emptyCommentsIcon}>
                  <Ionicons name="chatbubbles-outline" size={48} color="white" />
                </View>
                <Text style={styles.emptyCommentsText}>Nenhum comentário ainda</Text>
                <Text style={styles.emptyCommentsSubtext}>
                  Seja o primeiro a comentar!
                </Text>
              </View>
            </View>
          )}
        </View>
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
  
  headerSpacer: {
    width: 44,
  },
  
  scrollViewContent: {
    paddingBottom: theme.spacing.lg,
  },
  
  postCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  postCardGradient: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  postProfilePicture: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  
  postProfilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  
  postInfo: {
    flex: 1,
  },
  
  postUsername: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  postDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  
  postTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  
  postContent: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  
  postImageContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  postImage: {
    width: '100%',
    height: 200,
  },
  
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  statText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  
  commentsSection: {
    marginHorizontal: theme.spacing.md,
  },
  
  commentsHeader: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  commentsHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  
  commentsTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  commentForm: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  commentFormGradient: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  
  commentInput: {
    marginBottom: theme.spacing.md,
  },
  
  commentButton: {
    alignSelf: 'flex-end',
  },
  
  commentsList: {
    gap: theme.spacing.md,
  },
  
  commentCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  commentCardGradient: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  commentProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  
  commentProfilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  
  commentInfo: {
    flex: 1,
  },
  
  commentUsername: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  commentDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  
  commentContent: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  
  emptyComments: {
    paddingVertical: theme.spacing.xl,
  },
  
  emptyCommentsCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.large,
  },
  
  emptyCommentsIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
  },
  
  emptyCommentsText: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  emptyCommentsSubtext: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default PostDetailScreen;
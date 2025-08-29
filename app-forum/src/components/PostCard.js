import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const PostCard = ({
  post,
  onPress,
  onLike,
  onFavorite,
  onComment,
  onEdit,
  onDelete,
  isLiked = false,
  isFavorited = false,
  showActions = true,
  showUserInfo = true,
  currentUserId,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onLike(post.id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o like.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      console.log('PostCard - Favoritando post:', post.id);
      console.log('PostCard - Estado atual isFavorited:', isFavorited);
      console.log('PostCard - Count atual:', post.favorites_count);
      await onFavorite(post.id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o favorito.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = () => {
    onComment && onComment(post.id);
  };

  const handleEdit = () => {
    onEdit && onEdit(post);
  };

  const handleDelete = () => {
    onDelete && onDelete(post.id);
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={onPress}
        onPressIn={animatePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.colors.gradients.surface}
          style={styles.cardGradient}
        >
          {showUserInfo && (
            <View style={styles.header}>
              <View style={styles.userInfo}>
                {post.user?.profile_picture_url ? (
                  <Image
                    source={{ uri: post.user.profile_picture_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    style={styles.avatarPlaceholder}
                  >
                    <Ionicons name="person" size={24} color={theme.colors.text.primary} />
                  </LinearGradient>
                )}
                
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{post.user?.username || 'Usuário'}</Text>
                  <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
            <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
          </View>

          {showActions && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                <LinearGradient
                  colors={isLiked ? theme.colors.gradients.accent : theme.colors.gradients.glass}
                  style={styles.actionGradient}
                >
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isLiked ? theme.colors.text.primary : theme.colors.text.secondary} 
                  />
                  <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                    {post.likes_count || 0}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
                <LinearGradient
                  colors={theme.colors.gradients.glass}
                  style={styles.actionGradient}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
                  <Text style={styles.actionText}>{post.comments_count || 0}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleFavorite} style={styles.actionButton}>
                <LinearGradient
                  colors={isFavorited ? theme.colors.gradients.secondary : theme.colors.gradients.glass}
                  style={styles.actionGradient}
                >
                  <Ionicons 
                    name={isFavorited ? "star" : "star-outline"} 
                    size={20} 
                    color={isFavorited ? theme.colors.text.primary : theme.colors.text.secondary} 
                  />
                  <Text style={[styles.actionText, isFavorited && styles.actionTextActive]}>
                    {post.favorites_count || 0}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Botões de editar/deletar apenas para posts do usuário logado */}
              {currentUserId && post.user_id === currentUserId && (
                <View style={styles.ownerActions}>
                  <TouchableOpacity onPress={handleEdit} style={styles.ownerActionButton}>
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={styles.ownerActionGradient}
                    >
                      <Ionicons name="create-outline" size={16} color={theme.colors.text.primary} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleDelete} style={styles.ownerActionButton}>
                    <LinearGradient
                      colors={theme.colors.gradients.accent}
                      style={styles.ownerActionGradient}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.colors.text.primary} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  cardGradient: {
    padding: theme.spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
  },
  
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  userDetails: {
    flex: 1,
  },
  
  username: {
    ...theme.typography.h6,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  timestamp: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  
  content: {
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    ...theme.typography.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  
  content: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  
  actionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  
  actionTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  ownerActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  
  ownerActionButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  
  ownerActionGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostCard;

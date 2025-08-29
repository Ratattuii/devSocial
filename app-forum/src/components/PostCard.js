// src/components/PostCard.js

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
      <View style={[styles.container, style]}>
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
                  <Ionicons name="person" size={20} color={theme.colors.text.inverse} />
                </LinearGradient>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.username}>{post.user?.username || 'Usuário'}</Text>
                <Text style={styles.timestamp}>
                  {formatDate(post.created_at)}
                </Text>
              </View>
            </View>
            
            {(onEdit || onDelete) && (
              <View style={styles.actions}>
                {onEdit && (
                  <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                    <Ionicons name="create-outline" size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.contentContainer}
          onPress={() => {
            animatePress();
            onPress && onPress();
          }}
          activeOpacity={0.9}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.text}>{post.content}</Text>
            
            {post.image_url && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {showActions && (
          <View style={styles.footer}>
            <View style={styles.stats}>
              <TouchableOpacity 
                style={[styles.action, isLiked && styles.actionActive]} 
                onPress={handleLike}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.actionIcon,
                  isLiked && styles.actionIconActive
                ]}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isLiked ? theme.colors.error : theme.colors.text.secondary} 
                  />
                </View>
                <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                  {post.likes_count || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.action} 
                onPress={handleComment}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
                </View>
                <Text style={styles.actionText}>{post.comments_count || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.action, isFavorited && styles.actionActive]} 
                onPress={handleFavorite}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.actionIcon,
                  isFavorited && styles.actionIconActive
                ]}>
                  <Ionicons 
                    name={isFavorited ? "star" : "star-outline"} 
                    size={20} 
                    color={isFavorited ? theme.colors.accent : theme.colors.text.secondary} 
                  />
                </View>
                <Text style={[styles.actionText, isFavorited && styles.actionTextActive]}>
                  {post.favorites_count || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
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
  
  actions: {
    flexDirection: 'row',
  },
  
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  content: {
    padding: theme.spacing.lg,
  },
  
  title: {
    ...theme.typography.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  text: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  
  imageContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  
  postImage: {
    width: '100%',
    height: 200,
  },
  
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surfaceVariant,
  },
  
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
    minHeight: 44, // Garante área de toque mínima
  },
  
  actionActive: {
    backgroundColor: theme.colors.primary,
  },
  
  actionIcon: {
    marginRight: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  actionIconActive: {
    backgroundColor: theme.colors.text.inverse,
  },
  
  actionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  
  actionTextActive: {
    color: theme.colors.text.inverse,
  },
});

export default PostCard;

import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const { signOut } = useContext(AuthContext);

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        signOut();
        return;
      }

      await api.put(`/posts/${post.id}`, {
        title: title.trim(),
        content: content.trim(),
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      Alert.alert('Sucesso', 'Post atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar post:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o post.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Excluir Post',
      'Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmDeletePost },
      ]
    );
  };

  const confirmDeletePost = async () => {
    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        signOut();
        return;
      }

      await api.delete(`/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      Alert.alert('Sucesso', 'Post excluído com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao excluir post:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir o post.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner message="Processando..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.gradients.dark}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <LinearGradient
              colors={theme.colors.gradients.glass}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Editar Post</Text>
          
          <TouchableOpacity onPress={handleDeletePost} style={styles.deleteButton}>
            <LinearGradient
              colors={theme.colors.gradients.accent}
              style={styles.deleteButtonGradient}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollViewContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Formulário */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="create" size={20} color={theme.colors.text.secondary} />
                  <Input
                    placeholder="Digite o título do post"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    multiline
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Conteúdo</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text" size={20} color={theme.colors.text.secondary} />
                  <Input
                    placeholder="Digite o conteúdo do post"
                    value={content}
                    onChangeText={setContent}
                    style={[styles.input, styles.contentInput]}
                    multiline
                    numberOfLines={6}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonsSection}>
            <Button
              title="Salvar Alterações"
              onPress={handleUpdatePost}
              style={styles.saveButton}
            />
            
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  deleteButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  
  deleteButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  scrollViewContent: {
    paddingBottom: theme.spacing.lg,
  },
  
  formSection: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  
  formCard: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  
  inputLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  input: {
    flex: 1,
    marginLeft: theme.spacing.md,
    color: theme.colors.text.primary,
    ...theme.typography.body,
  },
  
  contentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  buttonsSection: {
    marginHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
  
  cancelButton: {
    marginBottom: theme.spacing.lg,
  },
});

export default EditPostScreen;

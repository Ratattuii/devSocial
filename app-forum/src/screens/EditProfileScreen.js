// src/screens/EditProfileScreen.js

import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, Image, TouchableOpacity,
  Platform
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProfileScreen = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const { signOut } = useContext(AuthContext);

  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialUser.profile_picture_url);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      setProfilePictureUrl(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação de senha não coincidem.');
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

      let finalProfilePictureUrl = profilePictureUrl;
      if (selectedImageUri) {
        const formData = new FormData();
        const filename = selectedImageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        const imageFile = {
            uri: Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', ''),
            name: Platform.OS === 'android' ? filename : `${initialUser.id}_${Date.now()}.${match ? match[1] : 'jpg'}`,
            type: type,
        };

        formData.append('profilePicture', imageFile);

        try {
          const uploadResponse = await api.post('/upload/profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
          });
          finalProfilePictureUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem de perfil:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da foto de perfil. Verifique o console para detalhes.');
          setIsSubmitting(false);
          return;
        }
      }

      const updateData = {
        username,
        email,
        profile_picture_url: finalProfilePictureUrl,
      };

      if (oldPassword && newPassword) {
        updateData.oldPassword = oldPassword;
        updateData.newPassword = newPassword;
      }

      await api.put('/users/me', updateData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o perfil.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner message="Atualizando perfil..." />;
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
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {/* Foto de Perfil */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureCard}>
            <View style={styles.profilePictureContainer}>
              {profilePictureUrl ? (
                <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={60} color="white" />
                </View>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.changePictureButton}>
                <View style={styles.changePictureGradient}>
                  <Ionicons name="camera" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.profilePictureText}>Toque para alterar a foto</Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            
            <Input
              label="Nome de usuário"
              value={username}
              onChangeText={setUsername}
              placeholder="Digite seu nome de usuário"
              style={styles.input}
            />
            
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
        </View>

        {/* Alteração de Senha */}
        <View style={styles.passwordSection}>
          <View style={styles.passwordCard}>
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
            <Text style={styles.sectionSubtitle}>
              Deixe em branco se não quiser alterar a senha
            </Text>
            
            <Input
              label="Senha Atual"
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Digite sua senha atual"
              secureTextEntry
              style={styles.input}
            />
            
            <Input
              label="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Digite a nova senha"
              secureTextEntry
              style={styles.input}
            />
            
            <Input
              label="Confirmar Nova Senha"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirme a nova senha"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonsSection}>
          <Button
            title="Salvar Alterações"
            onPress={handleUpdateProfile}
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
  
  profilePictureSection: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  profilePictureCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  
  profilePictureContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  
  changePictureGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  
  profilePictureText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  formSection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  formCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  
  input: {
    marginBottom: theme.spacing.md,
  },
  
  passwordSection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  
  passwordCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
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

export default EditProfileScreen;
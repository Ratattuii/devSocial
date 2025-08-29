

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';

const RegisterScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      signIn(token, user);
      
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message);
      Alert.alert(
        'Erro no Registro',
        error.response?.data?.message || 'Não foi possível criar a conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.gradients.dark}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={theme.colors.gradients.secondary}
                style={styles.logo}
              >
                <Ionicons name="person-add" size={48} color={theme.colors.text.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>
              Preencha os dados abaixo para começar
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome de usuário</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color={theme.colors.text.secondary} />
                <Input
                  placeholder="Digite seu nome de usuário"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: null }));
                    }
                  }}
                  error={errors.username}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color={theme.colors.text.secondary} />
                <Input
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  error={errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color={theme.colors.text.secondary} />
                <Input
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  error={errors.password}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.text.secondary} />
                <Input
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: null }));
                    }
                  }}
                  error={errors.confirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Já tem uma conta?{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('Login')}
              >
                Faça login
              </Text>
            </Text>
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
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  logo: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.large,
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
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  input: {
    flex: 1,
    marginLeft: theme.spacing.md,
    color: theme.colors.text.primary,
    ...theme.typography.body,
  },
  
  registerButton: {
    marginTop: theme.spacing.lg,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  linkText: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
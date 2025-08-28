// src/screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email ou usuário é obrigatório';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simular delay de login
    setTimeout(async () => {
      try {
        // Simular login bem-sucedido
        const mockToken = 'mock_token_' + Date.now();
        const mockUser = {
          id: 1,
          username: identifier,
          email: identifier.includes('@') ? identifier : identifier + '@email.com'
        };

        await AsyncStorage.setItem('userToken', mockToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
        signIn(mockToken);
        
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      } catch (error) {
        console.error('Erro no login:', error);
        Alert.alert(
          'Erro no Login',
          'Ocorreu um erro ao fazer login. Tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.colors.gradients.primary}
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
                colors={theme.colors.gradients.surface}
                style={styles.logo}
              >
                <Ionicons name="chatbubbles" size={48} color={theme.colors.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>
              Entre na sua conta para continuar compartilhando
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email ou Usuário"
              placeholder="Digite seu email ou nome de usuário"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) {
                  setErrors(prev => ({ ...prev, identifier: null }));
                }
              }}
              error={errors.identifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Senha"
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
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Não tem uma conta?{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('Register')}
              >
                Cadastre-se
              </Text>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.large,
  },
  
  loginButton: {
    marginTop: theme.spacing.lg,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  
  linkText: {
    color: theme.colors.accentLight,
    fontWeight: '600',
  },
});

export default LoginScreen;
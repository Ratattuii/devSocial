

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import Input from '../components/Input';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email ou nome de usuário é obrigatório';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      signIn(token, user);
      
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      Alert.alert(
        'Erro no Login',
        error.response?.data?.message || 'Credenciais inválidas. Tente novamente.'
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
        {/* Side Panel */}
        <View style={styles.sidePanel}>
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={styles.sidePanelGradient}
          >
            <View style={styles.sidePanelContent}>
              <View style={styles.brandSection}>
                <View style={styles.brandIcon}>
                  <Ionicons name="code-slash" size={40} color={theme.colors.text.primary} />
                </View>
                <Text style={styles.brandName}>DevSocial</Text>
                <Text style={styles.brandTagline}>Conecte-se. Compartilhe. Evolua.</Text>
              </View>
              
              <View style={styles.featuresSection}>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.featureText}>Comunidade ativa de desenvolvedores</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="share-social" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.featureText}>Compartilhe projetos e experiências</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.featureText}>Aprenda com a comunidade</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
              <Text style={styles.subtitleText}>
                Entre na sua conta para continuar
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color={theme.colors.text.secondary} />
                  <Input
                    placeholder="Email ou nome de usuário"
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
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color={theme.colors.text.secondary} />
                  <Input
                    placeholder="Sua senha"
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

              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>



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
        </View>
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
    flexDirection: 'row',
  },
  
  sidePanel: {
    width: screenWidth * 0.4,
    height: screenHeight,
  },
  
  sidePanelGradient: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  
  sidePanelContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  brandSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  
  brandIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  brandName: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  
  brandTagline: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  featuresSection: {
    marginBottom: theme.spacing.xxl,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  featureText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  
  header: {
    marginBottom: theme.spacing.xxl,
  },
  
  welcomeText: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  
  subtitleText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    opacity: 0.8,
  },
  
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  
  inputContainer: {
    marginBottom: theme.spacing.lg,
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
  
  loginButton: {
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
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (token, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
    } catch (e) {
      console.error('Erro ao salvar token/dados no AsyncStorage', e);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Iniciando signOut...');
    try {
      console.log('AuthContext: Removendo token do AsyncStorage...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('AuthContext: Token removido com sucesso');
      setUserToken(null);
      console.log('AuthContext: userToken definido como null');
    } catch (e) {
      console.error('Erro ao remover token do AsyncStorage:', e);
      setUserToken(null);
      console.log('AuthContext: userToken definido como null (mesmo com erro)');
    }
  };
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('AuthContext: Token carregado:', token ? 'SIM' : 'NÃO');
        if (token && !token.startsWith('mock_token')) {
          console.log('AuthContext: Token válido encontrado');
          setUserToken(token);
        } else {
          console.log('AuthContext: Token mock ou inválido, limpando...');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          setUserToken(null);
        }
      } catch (e) {
        console.error('Erro ao carregar token do AsyncStorage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
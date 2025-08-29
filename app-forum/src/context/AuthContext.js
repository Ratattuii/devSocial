import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (token, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
      setUser(userData);
    } catch (e) {
      console.error('Erro ao salvar token/dados no AsyncStorage', e);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Iniciando signOut...');
    console.log('AuthContext: userToken atual:', userToken);
    try {
      console.log('AuthContext: Removendo token do AsyncStorage...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('AuthContext: Token removido com sucesso');
      setUserToken(null);
      setUser(null);
      console.log('AuthContext: userToken definido como null');
      
      // Verificar se foi removido
      const remainingToken = await AsyncStorage.getItem('userToken');
      console.log('AuthContext: Token restante após remoção:', remainingToken);
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
          
          // Carregar dados do usuário
          try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
              const userData = JSON.parse(userDataString);
              setUser(userData);
              console.log('AuthContext: Dados do usuário carregados:', userData.username);
            }
          } catch (e) {
            console.error('Erro ao carregar dados do usuário:', e);
          }
        } else {
          console.log('AuthContext: Token mock ou inválido, limpando...');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          setUserToken(null);
          setUser(null);
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
    <AuthContext.Provider value={{ userToken, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
# 🚀 DevSocial - Rede Social com React Native e Node.js

Uma rede social moderna desenvolvida com **React Native (Expo)** para o frontend e **Node.js (Express)** com **MySQL** para o backend.

## ✨ Características

### 🎨 **Design Moderno**
- **Interface elegante** com gradientes e animações
- **Sistema de temas** consistente
- **Componentes reutilizáveis** e responsivos
- **UX otimizada** para mobile e web

### 🔐 **Autenticação Segura**
- **JWT Tokens** para autenticação
- **Criptografia de senhas** com bcrypt
- **Sessões persistentes** com AsyncStorage
- **Proteção de rotas** automática

### 📱 **Funcionalidades Principais**
- ✅ **Criar e visualizar posts**
- ✅ **Sistema de likes e favoritos**
- ✅ **Comentários em posts**
- ✅ **Perfil de usuário personalizável**
- ✅ **Upload de imagens**
- ✅ **Busca de posts**
- ✅ **Navegação intuitiva**

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React Native** com Expo
- **React Navigation** para navegação
- **Expo Linear Gradient** para gradientes
- **AsyncStorage** para persistência
- **Axios** para requisições HTTP

### **Backend**
- **Node.js** com Express
- **MySQL** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **Multer** para upload de arquivos
- **CORS** para comunicação

## 📁 Estrutura do Projeto

```
devSocial/
├── app-forum/                 # Frontend React Native
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── screens/          # Telas da aplicação
│   │   ├── context/          # Context API
│   │   ├── services/         # Serviços de API
│   │   └── theme/            # Sistema de temas
│   └── package.json
├── server/                   # Backend Node.js
│   ├── src/
│   │   ├── controllers/      # Controladores
│   │   ├── routes/          # Rotas da API
│   │   └── middleware/      # Middlewares
│   ├── database.sql         # Schema do banco
│   └── package.json
└── README.md
```

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js (versão 16 ou superior)
- MySQL (versão 8.0 ou superior)
- Expo CLI (`npm install -g @expo/cli`)

### **1. Configurar o Banco de Dados**
```sql
-- Execute o arquivo database.sql no MySQL
mysql -u root -p < database.sql
```

### **2. Configurar o Backend**
```bash
cd server
npm install
npm start
```

### **3. Configurar o Frontend**
```bash
cd app-forum
npm install
npx expo start --web
```

## 📱 Telas da Aplicação

### **🔐 Autenticação**
- **Login**: Interface moderna com validação
- **Registro**: Formulário completo com validação

### **🏠 Home**
- **Feed de posts** com interações
- **Criação de posts** com imagens
- **Sistema de busca**
- **Navegação para perfil**

### **👤 Perfil**
- **Informações do usuário**
- **Posts do usuário**
- **Posts favoritados**
- **Edição de perfil**

### **📝 Detalhes do Post**
- **Visualização completa** do post
- **Sistema de comentários**
- **Interações (like/favorite)**

## 🎨 Sistema de Design

### **Paleta de Cores**
- **Primary**: Indigo (#6366F1)
- **Secondary**: Emerald (#10B981)
- **Accent**: Amber (#F59E0B)
- **Background**: Light Gray (#F8FAFC)

### **Componentes**
- **Button**: Múltiplas variantes e estados
- **Input**: Com validação e animações
- **PostCard**: Layout responsivo
- **LoadingSpinner**: Animações suaves

## 🔧 Configuração do Banco de Dados

### **Tabelas Principais**
- `users`: Informações dos usuários
- `posts`: Posts da rede social
- `comments`: Comentários nos posts
- `likes`: Sistema de curtidas
- `favorites`: Sistema de favoritos

### **Triggers Automáticos**
- Atualização automática de contadores
- Integridade referencial
- Timestamps automáticos

## 📊 API Endpoints

### **Autenticação**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

### **Posts**
- `GET /api/posts` - Listar posts
- `POST /api/posts` - Criar post
- `GET /api/posts/:id` - Detalhes do post
- `DELETE /api/posts/:id` - Excluir post

### **Interações**
- `POST /api/posts/:id/like` - Curtir/descurtir
- `POST /api/posts/:id/favorite` - Favoritar/desfavoritar
- `POST /api/comments/:postId` - Comentar

### **Usuários**
- `GET /api/users/me` - Perfil do usuário
- `PUT /api/users/me` - Atualizar perfil
- `GET /api/users/me/posts` - Posts do usuário
- `GET /api/users/me/favorites` - Favoritos do usuário

## 🚀 Deploy

### **Frontend (Expo)**
```bash
npx expo build:web
```

### **Backend (Node.js)**
```bash
npm run build
npm start
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Desenvolvido com ❤️ para o projeto de Rede Social**

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**

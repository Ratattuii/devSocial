CREATE DATABASE IF NOT EXISTS devsocial;
USE devsocial;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de likes
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id)
);

-- Tabela de favoritos
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, post_id)
);

-- Tabela de comentários
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_favorites_post_id ON favorites(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- Triggers para atualizar contadores automaticamente

-- Trigger para likes
DELIMITER //
CREATE TRIGGER after_like_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
END//

CREATE TRIGGER after_like_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
END//

-- Trigger para favoritos
CREATE TRIGGER after_favorite_insert
AFTER INSERT ON favorites
FOR EACH ROW
BEGIN
    UPDATE posts SET favorites_count = favorites_count + 1 WHERE id = NEW.post_id;
END//

CREATE TRIGGER after_favorite_delete
AFTER DELETE ON favorites
FOR EACH ROW
BEGIN
    UPDATE posts SET favorites_count = favorites_count - 1 WHERE id = OLD.post_id;
END//

-- Trigger para comentários
CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
END//

CREATE TRIGGER after_comment_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
END//
DELIMITER ;

-- Inserir dados de exemplo
INSERT INTO users (username, email, password_hash, bio) VALUES
('admin', 'admin@devsocial.com', '$2b$10$rQZ8K9mN2pL1vX3yU6wA7e', 'Administrador do sistema'),
('joao123', 'joao@email.com', '$2b$10$rQZ8K9mN2pL1vX3yU6wA7e', 'Desenvolvedor React Native'),
('maria_dev', 'maria@email.com', '$2b$10$rQZ8K9mN2pL1vX3yU6wA7e', 'UX/UI Designer'),
('pedro_tech', 'pedro@email.com', '$2b$10$rQZ8K9mN2pL1vX3yU6wA7e', 'Full Stack Developer');

-- Inserir posts de exemplo
INSERT INTO posts (user_id, title, content, likes_count, comments_count, favorites_count) VALUES
(1, 'Bem-vindo ao DevSocial!', 'Esta é uma plataforma incrível para desenvolvedores compartilharem conhecimento e experiências. Vamos construir uma comunidade forte!', 25, 8, 12),
(2, 'Dicas de React Native', 'Compartilhando algumas dicas valiosas que aprendi desenvolvendo apps com React Native. A chave é sempre manter o código limpo e reutilizável!', 42, 15, 18),
(3, 'Design System Moderno', 'Acabamos de implementar um design system completamente novo com gradientes, animações e uma interface muito mais moderna. O que vocês acham?', 38, 12, 9),
(4, 'Backend com Node.js', 'Falando sobre como estruturar um backend robusto com Node.js, Express e MySQL. Segurança e performance são fundamentais!', 31, 10, 7);

-- Inserir alguns likes
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (4, 1),
(1, 2), (3, 2), (4, 2),
(1, 3), (2, 3), (4, 3),
(1, 4), (2, 4), (3, 4);

-- Inserir alguns favoritos
INSERT INTO favorites (user_id, post_id) VALUES
(2, 1), (3, 1),
(1, 2), (4, 2),
(1, 3), (2, 3),
(2, 4), (3, 4);

-- Inserir alguns comentários
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Excelente iniciativa! Vou participar bastante.'),
(3, 1, 'Adorei a ideia da plataforma!'),
(4, 1, 'Finalmente uma rede social para devs!'),
(1, 2, 'Muito útil essas dicas!'),
(3, 2, 'Vou aplicar essas práticas no meu projeto.'),
(4, 2, 'React Native é realmente incrível!'),
(1, 3, 'O design ficou muito moderno!'),
(2, 3, 'Gradientes estão na moda mesmo!'),
(4, 3, 'Animações suaves fazem toda diferença.'),
(1, 4, 'Node.js é minha stack favorita!'),
(2, 4, 'Express é muito flexível.'),
(3, 4, 'MySQL é uma excelente escolha para este projeto.');

-- Comando para verificar se tudo foi criado corretamente
SELECT 'Database criado com sucesso!' as status;

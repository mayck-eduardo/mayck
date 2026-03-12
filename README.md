# Mayck Eduardo - Portfolio & Blog CMS

Este projeto é um portfólio pessoal dinâmico integrado com um sistema de gerenciamento de conteúdo (CMS) para blog, utilizando **Firebase** para persistência de dados e autenticação.

## 🚀 Tecnologias Utilizadas

- **Vite**: Build tool rápida e moderna.
- **TypeScript**: Tipagem estática para maior segurança e manutenibilidade.
- **Firebase**:
  - **Firestore**: Banco de dados NoSQL para posts e links compartilhados.
  - **Authentication**: Sistema de login seguro para a área administrativa.
- **Vanilla CSS**: Estilização personalizada com foco em performance e design minimalista.
- **Animations**: Efeitos dinâmicos e cursor personalizado.

## ✨ Funcionalidades

- **Blog Dinâmico**: Renderização automática de artigos a partir do Firestore.
- **Painel Administrativo**: Área restrita para criação e gerenciamento de posts.
- **Links Temporários**: Sistema que gera URLs públicas temporárias (ex: 24h) para visualização de rascunhos ou posts específicos.
- **Design Responsivo**: Interface adaptada para diferentes tamanhos de tela.
- **Cursor Customizado**: Elementos interativos que seguem o movimento do mouse.

## 🛠️ Como Executar o Projeto

1.  **Clonar o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Instalar dependências**:
    ```bash
    npm install
    ```

3.  **Configurar Firebase**:
    - Crie um arquivo `.env` na raiz do projeto (veja a seção de segurança abaixo).
    - Adicione suas credenciais do Firebase:
      ```env
      VITE_FIREBASE_API_KEY=seu_api_key
      VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
      VITE_FIREBASE_PROJECT_ID=seu_project_id
      VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
      VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
      VITE_FIREBASE_APP_ID=seu_app_id
      ```

4.  **Rodar em modo de desenvolvimento**:
    ```bash
    npm run dev
    ```

5.  **Build para produção**:
    ```bash
    npm run build
    ```

## 🔒 Segurança

As chaves do Firebase incluídas em `src/firebase-config.ts` são necessárias para que o frontend se comunique com o serviço. No entanto, para maior segurança:

1.  **Regras do Firestore**: Certifique-se de configurar as regras de segurança no console do Firebase para permitir escrita apenas por usuários autenticados (Admin).
2.  **Variáveis de Ambiente**: Recomenda-se mover as chaves para um arquivo `.env` e não comitá-lo em repositórios públicos.
3.  **Restrição de API Key**: No console do Google Cloud, restrinja o uso da sua API Key apenas aos domínios onde o site será hospedado.

---
Desenvolvido por [Mayck Eduardo](https://github.com/mayck-eduardo).

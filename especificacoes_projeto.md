# Especificações do Projeto - Teste Frontend e Backend

## 1. Visão Geral
Este documento define os requisitos e especificações para o teste prático de desenvolvimento Frontend e Backend. O objetivo é avaliar as habilidades na criação de uma aplicação web fullstack, incluindo a construção de interfaces de usuário responsivas, integração com APIs, modelagem de banco de dados e implementação de regras de negócio.

## 2. Escopo do Teste
O candidato deverá desenvolver um **Sistema de Gestão Simplificado** com as seguintes funcionalidades principais:

### 2.1. Funcionalidades Core
*   **Autenticação:** Login e registro de usuários com controle de sessão.
*   **CRUD de Entidades:** Capacidade de Criar, Ler, Atualizar e Excluir registros (ex: Produtos de um Inventário ou Clientes de um CRM).
*   **Listagem e Filtros:** Exibir os dados em formato de lista ou tabela, com opções de busca (texto) e filtros básicos (status, categoria, etc.).
*   **Dashboard (Diferencial):** Uma página inicial com um resumo dos dados cadastrados e métricas simples.

## 3. Requisitos Técnicos

### 3.1. Frontend
*   **Framework Recomendado:** React.js / Next.js
*   **Estilização:** Tailwind CSS (ou similar como Styled Components/CSS Modules)
*   **Gerenciamento de Estado:** Conforme necessário (Context API, Zustand, etc.)
*   **Responsividade:** A aplicação deve ser utilizável tanto em dispositivos móveis quanto em desktops.
*   **Validação de Formulários:** Implementar validação no client-side (ex: React Hook Form com Zod).

### 3.2. Backend & Banco de Dados
*   **Arquitetura:** Pode ser implementado utilizando Next.js API Routes/Server Actions ou um backend dedicado (Node.js/Express, NestJS, etc.).
*   **Banco de Dados:** PostgreSQL (Fortemente recomendado o uso do **Supabase** para banco e autenticação).
*   **Comunicação com o BD:** Uso de ORM (Prisma, Drizzle) ou cliente nativo (Supabase Client).
*   **Segurança:** Tratamento de erros adequado, validação de dados no servidor e proteção de rotas privadas.

## 4. Critérios de Avaliação

O projeto será avaliado com base nos seguintes pilares:
1.  **Funcionalidade:** O código cumpre os requisitos solicitados de forma livre de bugs críticos?
2.  **Qualidade do Código:** Organização do projeto, nomenclatura de variáveis, componentização e legibilidade.
3.  **Arquitetura e Padrões:** Separação clara de responsabilidades entre interface (UI), lógica de negócios e acesso a dados.
4.  **UX/UI:** Cuidado com a experiência do usuário, feedbacks visuais (loading, mensagens de erro/sucesso) e design consistente.
5.  **Boas Práticas:** Uso correto do ecossistema escolhido (ex: hooks do React), controle de versão (commits lógicos).

## 5. Entregáveis

Para a entrega do teste, é necessário:
1.  O link de um repositório no **GitHub** (público).
2.  Um arquivo `README.md` contendo:
    *   Instruções claras de como clonar, instalar as dependências e executar o projeto localmente.
    *   Exemplo das variáveis de ambiente necessárias (`.env.example`).
    *   Breve descrição das decisões técnicas tomadas.
3.  *(Opcional, mas desejável)* Um link para o deploy da aplicação rodando em produção (Vercel, Netlify, Render, etc.).

## 6. Tempo de Execução
Não há um limite estrito de tempo, porém recomendamos que o teste seja finalizado e entregue em um prazo de **3 a 5 dias**. Foque na qualidade sobre a quantidade de funcionalidades.

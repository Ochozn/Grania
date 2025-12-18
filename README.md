# 🧘 Grania

> **Gestão financeira simplificada com Telegram e Inteligência Artificial.**

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Organize suas finanças com o poder da Inteligência Artificial em suas mãos com esta versão Community e Open Source. 🚀

---

## 🌟 Funcionalidades Inteligentes

Descubra como o Grania pode facilitar sua vida financeira:

- 📸 **Registre tudo por Foto, Áudio, Texto ou PDF**  
  Adicione transações de múltiplas formas: voz, texto, foto de nota fiscal ou arquivos PDF. A IA entende e processa para você.

- 🔔 **Lembretes Inteligentes**  
  Receba lembretes de contas a pagar e a receber diretamente no seu **Telegram** e E-mail diariamente. Nunca mais pague juros por atraso.

- 📊 **Consultas em Tempo Real**  
  Acompanhe seu saldo, extratos e movimentações de qualquer lugar, a qualquer hora.

- 🤖 **Categorização Automática**  
  Sistema inteligente que aprende com você e categoriza suas transações automaticamente (Ex: "Mercado", "Lazer", "Transporte").

---

## 💬 Como Funciona a Integração com Telegram

Transformamos seu chat do Telegram em um assistente financeiro pessoal.

### Exemplo de Uso:

1. **Você envia:**  
   > *"Recebi R$ 2000 de salário"*
2. **Grania responde:**  
   > *✅ Receita de **R$ 2000,00** adicionada à categoria **Salário**. Seu saldo atual é **R$ 2000,00**.*

3. **Você envia:**  
   > *"Paguei R$ 500 de aluguel"*
4. **Grania responde:**  
   > *💸 Despesa de **R$ 500,00** adicionada à categoria **Moradia**. Seu saldo atual é **R$ 1500,00**.*

### O Fluxo Mágico:

1.  **Envie uma Mensagem:** Texto, Áudio ou Foto da nota fiscal para o bot no Telegram.
2.  **IA Processa:** Nossa inteligência artificial analisa o conteúdo, extrai valores, datas e categorias.
3.  **Atualização Automática:** Seus dados são salvos instantaneamente no banco de dados.
4.  **Feedback Imediato:** Você recebe a confirmação e o saldo atualizado na hora.

---

## 🤝 Comunidade e Open Source

Este projeto é **100% Open Source**. Acreditamos que o controle financeiro deve ser acessível, transparente e seguro.

O **Grania Community Edition** permite que você:
- 🏠 **Hospede seus próprios dados:** Tenha privacidade total rodando o sistema em sua própria infraestrutura.
- 🛠 **Personalize:** Adicione novas funcionalidades, integrações ou adapte para seu uso específico.
- 🌎 **Colabore:** Ajude a melhorar o código, corrigir bugs e criar o melhor gestor financeiro do mundo.

---

## 🛠️ Guia de Instalação (Docker & Self-Hosting)

Este tutorial guia você para rodar o **Grania** completo (Backend, Banco de Dados, IA e Frontend) na sua máquina local ou servidor usando Docker.

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (versão 18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para rodar o backend localmente)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/grania-community.git
cd grania-community
```

### 2. Configurando o Backend (Supabase)

Utilizamos o Supabase (Postgres + Auth + Edge Functions) como backend. Você pode rodar a stack completa do Supabase localmente com Docker.

1.  Certifique-se que o Docker está rodando.
2.  Inicie o Supabase:

```bash
npx supabase start
```
*Isso irá baixar e iniciar os containers do Postgres, Auth, Storage, etc.*

3.  Após iniciar, você verá as credenciais (API URL, Anon Key). **Guarde-as**.

4.  Deploy das Migrations (Estrutura do Banco):
    *O comando start já deve aplicar as migrações, mas para garantir:*
```bash
npx supabase migration up
```

5.  Deploy das Edge Functions (Telegram Bot):
```bash
npx supabase functions serve --env-file ./supabase/.env.local
```

### 3. Configurando o Frontend

1.  Entre na pasta web:
```bash
cd web
```

2.  Instale as dependências:
```bash
npm install
```

3.  Crie um arquivo `.env` na pasta `web` com as credenciais do seu Supabase local:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sua-anon-key-gerada-no-passo-2
```

4.  Rode o frontend:
```bash
npm run dev
```
Acesse `http://localhost:5173`.

### 4. Configurando o Bot do Telegram

Para que a integração funcione localmente, você precisa expor sua Edge Function para a internet (usando ngrok ou o túnel do Supabase) e configurar o bot no Telegram.

1. Crie um novo bot no Telegram conversando com o **@BotFather** e pegue o `TELEGRAM_BOT_TOKEN`.
2. Configure o Webhook do bot para apontar para sua Edge Function `telegram-webhook`.

---

## 🚀 Contribuindo

Pull Requests são muito bem-vindos! Para mudanças maiores, por favor abra uma *issue* primeiro para discutir o que você gostaria de mudar.

1.  Fork o projeto
2.  Crie sua Feature Branch (`git checkout -b feature/MinhaFeature`)
3.  Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4.  Push para a Branch (`git push origin feature/MinhaFeature`)
5.  Abra um Pull Request

---

**Transforme sua Gestão Financeira. Não perca mais tempo com planilhas.**
Experimente o Grania hoje mesmo! 🚀

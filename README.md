# TCC NVR Frontend

Sistema frontend Angular para gerenciamento de câmeras e gravações NVR (Network Video Recorder). Este projeto implementa uma interface web moderna e responsiva para controle de câmeras IP e visualização live/VOD, utilizando o tema **Cyber Slate**.

## Visão Geral do Sistema

### Identidade Visual
O projeto utiliza um tema "Cyber Slate" focado em ergonomia visual para monitoramento contínuo:
- **Fundo**: Dark Slate (`#000` / `#1e293b`)
- **Destaques**: Acentos sutis em Azul e Vermelho (para status offline)
- **Grid Inteligente**: Dashboard com auto-ajuste para grids 1x1 a 5x5, mantendo proporção 16:9.

### Arquitetura
- **Framework**: Angular 20.3.x (Standalone Components)
- **Estilo**: CSS Puro (Glassmorphism + Grid Layouts)
- **Backend API**: http://127.0.0.1:8000/api/v1 (Mock Disponível)
- **Autenticação**: JWT Bearer Token

### Estrutura de Pastas

```
src/app/
├── auth/                     # Login e Registro
├── camera-list/             # Gerenciamento (Tabela Compacta)
├── dashboard/               # Grid de Câmeras (Live View)
├── layout/                  # Sidebar, Topbar, Layout Wrapper
├── camera.ts                # Serviços e Models
├── app.routes.ts            # Roteamento
└── app.config.ts            # Configuração Global
```

### Funcionalidades Implementadas

#### 1. **Dashboard de Monitoramento**
- Grid dinâmico selecionável (1x1 até 5x5).
- Auto-ajuste de layout para caber na tela sem scroll desnecessário.
- Proporção de vídeo travada em 16:9.
- Indicadores de status (LIVE/OFFLINE) e Timestamp em tempo real.

#### 2. **Gerenciamento de Câmeras**
- Listagem em tabela compacta e centralizada.
- Busca rápida por Nome ou IP.
- Indicadores visuais de gravação (LEDs).
- Máscara de segurança para URLs RTSP.

#### 3. **Sistema de Autenticação**
- Login seguro com JWT.
- Proteção de rotas via `AuthGuard`.


Para facilitar o desenvolvimento e os testes do frontend sem a necessidade de um backend real, o projeto inclui um servidor mock baseado em Express.js.

### Como Iniciar

1.  **Abra um terminal separado** na raiz do projeto.
2.  Execute o seguinte comando para iniciar o servidor mock:

```bash
npm run mock:server
```

O servidor mock será executado em `http://localhost:8000`, que é a URL configurada no ambiente de desenvolvimento (`src/environments/environment.ts`).

**Importante**: Mantenha este terminal em execução enquanto desenvolve. A aplicação Angular (`ng serve`) deve ser executada em seu próprio terminal.

### Credenciais de Teste

Para fazer login no sistema usando o servidor mock, utilize as seguintes credenciais:
- **Email**: `test@test.com`
- **Senha**: `password`

## Development Server

Para iniciar o servidor de desenvolvimento:

```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200/`

## Build

Para fazer o build do projeto:

```bash
ng build
```

Os artefatos serão armazenados no diretório `dist/`

## Testes

Para executar os testes unitários:

```bash
ng test
```

## Docker

O projeto inclui configuração Docker com nginx para produção:

```bash
docker-compose up
```

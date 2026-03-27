# TCC NVR Frontend

Sistema frontend desenvolvido em **Angular 20** para gerenciamento de câmeras IP e gravações de um **NVR (Network Video Recorder)**.  
Este projeto implementa uma interface web moderna, responsiva e focada em ergonomia para ambientes de monitoramento contínuo, utilizando o tema visual **Cyber Slate** (dark, com glassmorphism e acentos em azul/vermelho).

> Este README foi escrito de forma detalhada para servir como base de documentação técnica do TCC, descrevendo arquitetura, módulos, fluxos de uso e integração com o backend.

---

## 1. Objetivo do Projeto

O objetivo deste frontend é prover uma interface rica para:

- **Cadastro, listagem e edição de câmeras IP**;
- **Visualização ao vivo (live)** das câmeras;
- **Acesso às gravações (playback)**, com seleção por data/segmento;
- **Gestão de usuários e permissões** (Admin x Visualizador);
- **Configuração de parâmetros globais do sistema**, como armazenamento e interface.

A aplicação consome uma API REST (FastAPI) que, por sua vez, integra com o **MediaMTX** para streaming de vídeo (HLS/WebRTC) e gravações.  
Para desenvolvimento, existe também um **servidor mock** em Node/Express (`mock-backend.js`) que simula os endpoints principais.

---

## 2. Visão Geral da Arquitetura

### 2.1 Tecnologias Principais

- **Framework:** Angular 20.x (Standalone Components)
- **Linguagem:** TypeScript
- **Estilo:** CSS puro, com foco em:
  - Glassmorphism
  - Layouts com CSS Grid e Flexbox
  - Tema escuro “Cyber Slate”
- **Backend API padrão (dev):** `http://127.0.0.1:8000/api/v1`  
  (configurado em [`src/environments/environment.ts`](src/environments/environment.ts))
- **Autenticação:** JWT Bearer Token, via [`AuthService`](src/app/auth/auth.ts)
- **Streaming de vídeo:** via URLs HLS/WebRTC geradas pelo backend/MediaMTX
- **Build/Deploy (prod):** Angular buildado e servido por **nginx** (via `docker-compose`)

### 2.2 Arquitetura de Pastas Frontend

Estrutura principal em [`src/app`](src/app):

```text
src/app/
├── app.ts               # Componente raiz (shell da aplicação)
├── app.html             # Template raiz: router-outlet, loading, toasts, confirm dialog
├── app.css              # Estilos gerais do shell
├── app.routes.ts        # Definição das rotas principais da aplicação

├── auth/                # Autenticação e controle de acesso
│   ├── auth.ts          # AuthService: login, registro, token, roles, usuários
│   ├── auth-guard.ts    # Guard de rota para exigir login
│   ├── role-guard.ts    # Guard de rota para exigir papel (ex: Admin)
│   ├── login/           # Tela de Login
│   ├── register/        # Tela de Registro (criação de conta)
│   └── access-denied/   # Tela de “Acesso Negado”

├── camera.ts            # Serviço de câmeras e tipos auxiliares (e.g. RecordingSegment)
├── camera.model.ts      # Interface Camera (id, name, rtsp_url, is_recording, etc)

├── camera-list/         # Listagem e gerenciamento de câmeras
├── camera-create/       # Formulário de criação de câmera
├── camera-edit/         # Formulário de edição de câmera
├── camera-view/         # Visualização ao vivo (live viewer)
├── camera-playback/     # Tela de playback / gravações

├── dashboard/           # Dashboard de monitoramento (grid de câmeras)
│   └── camera-feed/     # Componente individual de feed de câmera no grid

├── layout/
│   └── topbar/          # Topbar com relógio, saudação e papel do usuário

├── settings/            # Configurações globais do NVR
│   ├── settings.component.ts / .html / .css
│   └── user-create-modal/ # Modal para criação de usuário (Admin)

├── shared/
│   ├── toast/           # Sistema de notificações (toasts)
│   └── confirm-dialog/  # Diálogo de confirmação reutilizável

├── loading/             # Overlay de “Carregando...”
└── app.config.ts        # Configurações globais de providers/rota (se aplicável)
```

Estilos globais estão em [`src/styles.css`](src/styles.css), onde são definidos:

- Variáveis CSS de tema (`--bg-dark`, `--text-primary`, `--color-primary`, etc)
- Utilitários globais `.glass-panel`, `.btn`, `.btn-primary` etc.
- Tipografia base.

---

## 3. Fluxos e Funcionalidades

### 3.1 Autenticação e Controle de Acesso

**Principais arquivos:**

- Serviço: [`AuthService`](src/app/auth/auth.ts)
- Tela de Login: [`LoginComponent`](src/app/auth/login/login.ts)
- Tela de Registro: [`RegisterComponent`](src/app/auth/register/register.ts)
- Tela de Acesso Negado: [`AccessDeniedComponent`](src/app/auth/access-denied/access-denied.component.ts)
- Guards: `authGuard` e `roleGuard` (em [`src/app/auth`](src/app/auth))

**Fluxo de Login:**

1. Usuário acessa `/login` ([`LoginComponent`](src/app/auth/login/login.ts)).
2. Informa email e senha.
3. O componente chama `authService.login(email, password)`:
   - POST em `/api/v1/login`
   - Em sucesso: salva `access_token`, `user_id`, `user_role`, `user_name` no `localStorage`.
   - Redireciona para `/cameras` (lista de câmeras).
4. Em falha: exibe mensagem de erro na própria tela de login.

**Fluxo de Registro:**

- A tela `/register` ([`RegisterComponent`](src/app/auth/register/register.ts)) permite criar um novo usuário (no mock backend, público; na API real, normalmente restrito a admin).
- Chama `authService.register(email, full_name, password)` (POST `/api/v1/usuarios`).
- Em sucesso: mostra toast de sucesso e redireciona para `/login`.

**Controle de Acesso nas Rotas:**

Em [`app.routes.ts`](src/app/app.routes.ts), rotas protegidas utilizam:

- `authGuard` — verifica se existe token válido (login realizado).
- `roleGuard` — para rotas que exigem papel específico (ex: Admin) como `/settings`.

A tela [`AccessDeniedComponent`](src/app/auth/access-denied/access-denied.component.ts) é exibida quando um usuário tenta acessar rota sem permissão.

**Gestão de Sessão:**

- `AuthService.isLoggedIn()`, `getToken()`, `getRole()`, `getUserName()` auxiliam em componentes como:
  - [`TopbarComponent`](src/app/layout/topbar/topbar.component.ts) para exibir nome e papel.
  - [`SettingsComponent`](src/app/settings/settings.component.ts) para decidir se carrega lista de usuários.

---

### 3.2 Gestão de Câmeras

**Modelo:**

- [`Camera`](src/app/camera.model.ts)

```ts
export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  visualisation_url_hls?: string;
  visualisation_url_webrtc?: string;
  path_id: string;
  path_id_low?: string;
  is_recording: boolean;
  created_by_user_Id?: number;
}
```

**Serviço:**

- [`CameraService`](src/app/camera.ts) encapsula chamadas à API `/api/v1/camera` e afins, além do tipo [`RecordingSegment`](src/app/camera.ts), usado para playback.

#### 3.2.1 Listagem de Câmeras

- Componente: [`CameraListComponent`](src/app/camera-list/camera-list.ts)
- Rota típica: `/cameras`

Funcionalidades:

- Exibe tabela compacta de câmeras, com colunas:
  - Preview/status
  - Nome
  - Status de gravação (Gravando / Parado)
  - URL RTSP mascarada
  - Ações
- Busca rápida por nome/IP.
- Ícones de ação:
  - **Ver ao Vivo**: `[routerLink]="['/cameras/view', cam.id]"` abre [`CameraViewComponent`](src/app/camera-view/camera-view.ts).
  - **Gravações**: `[routerLink]="['/cameras/playback', cam.id]"` abre [`CameraPlaybackComponent`](src/app/camera-playback/camera-playback.ts).
  - **Editar** (somente admin, via `authService.isAdmin()`): abre `/cameras/edit/:id`.
  - **Excluir** (somente admin): abre diálogo de confirmação via [`ConfirmDialogService`](src/app/shared/confirm-dialog/confirm-dialog.service.ts).

Remoção de câmeras:

- Método `deleteCamera(id: number)` em [`CameraListComponent`](src/app/camera-list/camera-list.ts):
  - Invoca `confirmService.confirm(...)`.
  - Em confirmação, chama `cameraService.deleteCamera(id)`.
  - Mostra toasts de sucesso ou erro via [`ToastService`](src/app/shared/toast/toast.service.ts).

A tabela é fortemente estilizada (ver CSS dentro do próprio componente) para seguir o tema “Cyber Slate”.

#### 3.2.2 Criação de Câmera

- Componente: [`CameraCreateComponent`](src/app/camera-create/camera-create.ts)
- Template: [`camera-create.html`](src/app/camera-create/camera-create.html)
- Estilos: [`camera-create.css`](src/app/camera-create/camera-create.css)

Funcionalidades:

- Formulário com:
  - Nome da câmera
  - URL RTSP (campo monoespaçado)
  - Toggle “Gravação Automática” (`camera.is_recording`).
- Ao submeter:
  - Chama `cameraService.createCamera(this.camera)`.
  - Em sucesso: toast “Câmera criada com sucesso!” e navegação para `/cameras`.
  - Em erro: toast de erro.

Layout:

- Página com `.form-page` centralizada vertical/horizontalmente.
- Container em **glassmorphism** `.glass-panel`.
- Componente de switch reutilizável (CSS replicado também em edição).

#### 3.2.3 Edição de Câmera

- Componente: [`CameraEditComponent`](src/app/camera-edit/camera-edit.ts)
- Template: [`camera-edit.html`](src/app/camera-edit/camera-edit.html)
- Estilos: [`camera-edit.css`](src/app/camera-edit/camera-edit.css)

Funcionalidades:

- Carrega dados da câmera via `CameraService` a partir do `id` da rota.
- Campos:
  - Nome
  - URL RTSP
  - Toggle de “Gravação Automática” (`is_recording`).
- Ao submeter:
  - `cameraService.updateCamera(this.camera.id, this.camera)` (PUT `/api/v1/camera/{id}`).
  - Toast de sucesso/erro e redirecionamento.

---

### 3.3 Visualização ao Vivo (Live)

- Componente: [`CameraViewComponent`](src/app/camera-view/camera-view.ts)
- Estilos: [`camera-view.css`](src/app/camera-view/camera-view.css)

Responsabilidades:

- Ler `id` da câmera via `ActivatedRoute`.
- Buscar detalhes da câmera via [`CameraService`](src/app/camera.ts).
- Exibir o vídeo a partir do `visualisation_url_hls` ou `visualisation_url_webrtc` retornados pela API.
- Tratar cenários **online/offline**:
  - Quando não há URL HLS, o layout exibe um placeholder “offline” com estilo “cyberpunk”.
- A página ocupa a tela toda (`view-wrapper` fixo em `100vw x 100vh`), respeitando proporção 16:9 e tema escuro.

---

### 3.4 Dashboard de Monitoramento (Grid de Câmeras)

- Módulo principal: [`dashboard`](src/app/dashboard)
- Componente de feed: [`CameraFeedComponent`](src/app/dashboard/camera-feed/camera-feed.component.ts)

Funcionalidades esperadas (de acordo com README e CSS):

- Grid dinâmico (1x1 até 5x5) para exibir múltiplas câmeras simultaneamente.
- Ajuste inteligente para ocupar a área disponível, mantendo proporção 16:9.
- Em cada **tile**:
  - Status LIVE/OFFLINE.
  - Timestamp em tempo real.
  - Placeholder visual quando stream não está disponível (`.offline-placeholder`).
- Estética:
  - Fundo `#0f172a`.
  - Ícones grandes, cores de status, efeitos sutis para não cansar o operador.

---

### 3.5 Playback (Gravações)

> Importante: a documentação original do backend foi atualizada em [`Não sobe/backend_integration_guide.md`](Não sobe/backend_integration_guide.md) descrevendo o fluxo correto de playback. O frontend já segue essa nova especificação.

- Componente: [`CameraPlaybackComponent`](src/app/camera-playback/camera-playback.ts)
- Estilos: definidos inline no próprio componente (template + `styles` array)

Principais conceitos:

- `RecordingSegment` ([`RecordingSegment` em `camera.ts`](src/app/camera.ts)):
  - `start: string` (data/hora de início)
  - `duration: number` (segundos)
  - `url: string` (endpoint/URL para o segmento)

**Layout Geral:**

- Grid com duas colunas:
  - Sidebar de câmeras (“Fontes”).
  - “Main stage” com player, timeline e lista de eventos/segmentos.

#### 3.5.1 Sidebar de Fontes

- Lista de câmeras (via [`CameraService`](src/app/camera.ts)).
- Campo de busca.
- Seleção de câmera atual (`selectedCameraId`).

#### 3.5.2 Navegador de Datas

- “Top strip” com:
  - Botões **anterior/próximo dia**.
  - Lista de “date-pills” exibindo dias próximos.
  - Alguns elementos de controle de data (possível seletor por calendário).

#### 3.5.3 Player e Timeline

- Player central exibindo o vídeo do segmento atual (`currentSegment`).
- `vcformatTime()` ([`CameraPlaybackComponent`](src/app/camera-playback/camera-playback.ts)) formata horários `HH:mm:ss`.
- `formatDuration()` converte duração em segundos para formato amigável (`X min`, `< 1 min` etc.).
- Timeline do dia:
  - Slider (`input type="range"`) mapeado de `timelineMin` a `timelineMax`.
  - Ao mover o slider, chama-se `onTimelineChange($event)` para sincronizar com segmento mais próximo.
  - Labels de início/fim de dia na timeline.

#### 3.5.4 Lista de Eventos (Segmentos)

- Painel “Eventos” à direita:
  - Contador de segmentos (`{{ recordings.length }}`).
  - Loader (`isLoading`).
  - Card para cada `rec` em `recordings`:
    - `event-time`: exibe `vcformatTime(rec.start)`.
    - `event-type`: ícone + label “Gravação”.
    - `event-dur`: duração formatada.
  - Clique em um card chama `playSegment(rec)`, trocando o vídeo em reprodução.

Integração com API:

- Fluxo usual:
  1. `GET /api/v1/camera/{id}/recordings` → carrega lista de segmentos disponíveis.
  2. Ao escolher segmento, `GET /api/v1/camera/{id}/playback-url?token=...` (depende da implementação backend) para obter URL protegida.
  3. Player (HTML5 `<video>` ou `<iframe>`) usa a URL retornada pelo backend.

No ambiente mock, [`mock-backend.js`](mock-backend.js) já fornece:

- `/api/v1/camera/:id/recordings` (lista segments fake).
- `/api/v1/camera/:id/playback-url` (gera token e retorna `playbackUrl`).
- `/api/v1/playback/video` (faz redirect para MP4 público “Big Buck Bunny”).

---

### 3.6 Configurações do Sistema

- Componente: [`SettingsComponent`](src/app/settings/settings.component.ts)
- Template: [`settings.component.html`](src/app/settings/settings.component.html)
- Estilos: [`settings.component.css`](src/app/settings/settings.component.css)
- Serviço: [`SettingsService`](src/app/settings/settings.service.ts) (não mostrado no trecho acima, mas utilizado pelo componente)

Responsabilidades:

1. **Interface de Monitoramento**
   - Escolha do *grid padrão* ao iniciar (2x2, 3x3, 4x4).
   - Outras preferências visuais do dashboard.

2. **Armazenamento (Storage)**
   - `settings.storage.retentionDays`: dias de retenção de gravações.
   - `settings.storage.recordingSplitMinutes`: tamanho dos segmentos de gravação (ex: 5, 15, 30, 60 min).
   - `settings.storage.autoCleanup`: toggle “Limpeza Automática”.

3. **Sistema e Rede**
   - Cartão com informações como:
     - Versão do frontend (ex: `v1.1.0-beta`).
     - Status do backend.
     - Parâmetros de conexão.

4. **Gerenciamento de Usuários (somente Admin)**

   - Exibido apenas se `authService.isAdmin()` retornar `true`.
   - Lista de usuários (`authService.getUsers()` → GET `/api/v1/usuarios`).
   - Botão “Adicionar” abre modal [`UserCreateModalComponent`](src/app/settings/user-create-modal/user-create-modal.component.ts).
   - Remoção de usuário:
     - Modal de confirmação próprio na view.
     - Chamada `authService.deleteUser(userId)` (DELETE `/api/v1/usuarios/{id}`).
   - Restrição:
     - O usuário logado não pode remover a si mesmo (`user.id !== authService.getUserId()`).

5. **Persistência e Edição**

   - `settingsService.settings$` é um `Observable` com estado global.
   - Ao abrir a tela, é feito `subscribe` e cópia profunda (`JSON.parse(JSON.stringify(s))`) para edição local segura.
   - Botões:
     - “Restaurar Padrão” — reseta configurações para default (via `resetDefaults()`).
     - “Salvar Alterações” — persiste as alterações via `saveSettings()`, com toasts de feedback.

---

### 3.7 Sistema de UI Compartilhada

#### 3.7.1 Topbar

- [`TopbarComponent`](src/app/layout/topbar/topbar.component.ts)

Funções:

- Mostrar título (“MONITORAMENTO”).
- Exibir:
  - Nome do usuário (`authService.getUserName()` ou `/perfil`).
  - Badge “ADMIN” se `authService.isAdmin()` for verdadeiro.
- Relógio em tempo real (HH:mm:ss) e data (dd/MM/yyyy) atualizados por `setInterval` no `ngOnInit`.

#### 3.7.2 Toasts

- Serviço: [`ToastService`](src/app/shared/toast/toast.service.ts)
- Componente: [`ToastComponent`](src/app/shared/toast/toast.component.ts)

Características:

- `BehaviorSubject<Toast[]>` mantém lista de toasts ativos.
- `Toast` contém `message`, `type` (`success | error | info`) e `id`.
- Métodos:
  - `show(message, type)`
  - `success(message)`
  - `error(message)`
- Auto-dismiss: cada toast é removido automaticamente após 3 segundos.
- UI:
  - Glass panel no canto, animação `slideIn`, cor da borda/ícone por tipo (verde, vermelho, azul).

#### 3.7.3 Diálogo de Confirmação

- Componente/Serviço: [`ConfirmDialogComponent` / `ConfirmDialogService`](src/app/shared/confirm-dialog/confirm-dialog.service.ts)
- Registrado no componente raiz [`AppComponent`](src/app/app.ts) via `@ViewChild`.

Uso típico:

```ts
const confirmed = await this.confirmService.confirm(
  'Remover Câmera',
  'Tem certeza que deseja remover esta câmera? Esta ação não pode ser desfeita.'
);
if (confirmed) { /* ... */ }
```

- Apresenta modal com:
  - Título
  - Mensagem
  - Botões “Cancelar” e “Confirmar”
- Animações de `fadeIn` e `scaleIn`, fundo escurecido com blur.

#### 3.7.4 Loading Global

- Componente: [`LoadingComponent`](src/app/loading/loading.ts)
- Serviço: `LoadingService` (não listado acima, mas usado em [`AuthService`](src/app/auth/auth.ts))
- Mostra overlay global enquanto requisições críticas ocorrem (ex: login, criar usuário, etc).

---

## 4. Integração com Backend e Mock

### 4.1 Backend Real (FastAPI + MediaMTX)

A documentação detalhada do backend está em [`README-BACKEND.md`](README-BACKEND.md) e o guia específico de integração de playback em [`Não sobe/backend_integration_guide.md`](Não sobe/backend_integration_guide.md).

Principais endpoints (resumo):

- Autenticação e usuários:
  - `POST /api/v1/login`
  - `GET /api/v1/perfil`
  - `GET /api/v1/usuarios` (Admin)
  - `POST /api/v1/usuarios` (Admin)
  - `DELETE /api/v1/usuarios/{id}` (Admin)
- Câmeras:
  - `POST /api/v1/camera`
  - `GET /api/v1/camera/{id}`
  - `PUT /api/v1/camera/{id}`
  - `GET /api/v1/camera/user/{uid}`
- Gravações / Playback:
  - `GET /api/v1/camera/{id}/recordings`
  - `GET /api/v1/camera/{id}/playback-url`
  - `GET /api/v1/playback/video`

### 4.2 Servidor Mock (Para Desenvolvimento)

Arquivo: [`mock-backend.js`](mock-backend.js)

- Implementado com **Express.js**.
- Porta padrão: `8000` (compatível com `environment.ts`).
- Simula:
  - Login (`POST /api/v1/login` com credenciais `test@test.com` / `password`).
  - Registro de usuários.
  - CRUD de câmeras (lista in-memory).
  - Listagem de gravações (`/camera/:id/recordings`).
  - Geração de URL de playback (`/camera/:id/playback-url`).
  - Endpoint de vídeo (`/playback/video`) que redireciona para um MP4 público.

---

## 5. Ambiente, Build e Execução

### 5.1 Ambiente de Desenvolvimento

**1. Iniciar Mock Backend**

Na raiz do projeto:

```bash
npm run mock:server
```

O servidor mock rodará em `http://localhost:8000`.

> Importante: mantenha este terminal aberto durante o desenvolvimento.

**2. Iniciar Servidor Angular**

Em outro terminal:

```bash
ng serve
```

Aplicação disponível em: `http://localhost:4200/`.

### 5.2 Credenciais de Teste (Mock)

- **Email:** `test@test.com`  
- **Senha:** `password`

Essas credenciais estão configuradas em [`mock-backend.js`](mock-backend.js).

### 5.3 Build de Produção

```bash
ng build
```

Os artefatos gerados serão colocados em `dist/`.

### 5.4 Testes Unitários

```bash
ng test
```

Alguns componentes já possuem `*.spec.ts` básicos, como:

- [`AppComponent`](src/app/app.spec.ts)
- [`LoginComponent`](src/app/auth/login/login.spec.ts)
- [`RegisterComponent`](src/app/auth/register/register.spec.ts)
- [`CameraListComponent`](src/app/camera-list/camera-list.spec.ts)
- [`CameraEditComponent`](src/app/camera-edit/camera-edit.spec.ts)

### 5.5 Docker / Produção

O projeto inclui configuração para servir o build Angular via **nginx**, com suporte a backend na mesma stack:

- Arquivos relevantes:
  - [`docker-compose.yml`](docker-compose.yml)
  - [`dockerfile`](dockerfile)
  - [`nginx.conf`](nginx.conf)

Para subir ambiente completo (frontend + nginx + backend, conforme configurado):

```bash
docker-compose up --build
```

---

## 6. Considerações de Design de Interface

### 6.1 Tema Cyber Slate

Definido principalmente em [`src/styles.css`](src/styles.css):

- Fundo escuro (`#0f172a`, `#1e293b`).
- Glassmorphism em `.glass-panel`:
  - `background: rgba(30, 41, 59, 0.7);`
  - `backdrop-filter: blur(12px);`
  - `border: 1px solid rgba(255, 255, 255, 0.05);`
- Tipografia:
  - Fonte principal: `Inter` (ou similar).
  - Fonte monoespaçada: `JetBrains Mono` para timestamps e URLs.

### 6.2 Usabilidade em Ambientes de Monitoramento

- **Evitar fadiga visual:**
  - Tema escuro.
  - Contrastes moderados.
  - Destaques sutis apenas onde necessário (status, botões primários).
- **Informações críticas destacadas:**
  - Status LIVE/OFFLINE.
  - Timestamps.
  - Badges de ADMIN.
- **Componentes responsivos:**
  - Layouts com `grid-template-columns` adaptativos.
  - Formulários que funcionam bem em diferentes resoluções.
- **Feedback imediato:**
  - Toasts para sucesso/erro.
  - Loaders (`LoadingComponent` e spinners locais em modais).

---

## 7. Possíveis Extensões Futuras (Sugestões para o TCC)

Algumas ideias que podem ser citadas na seção de trabalhos futuros do TCC:

- Integração com **detecção de movimento** e eventos inteligentes.
- Modo **mosaico inteligente**, priorizando câmeras com evento ativo.
- Exportação e download de trechos específicos de gravações.
- Auditoria de acesso (log de quem viu qual câmera, quando).
- Suporte a múltiplas instâncias de NVR/MediaMTX (multi-site).
- Internacionalização (i18n) e suporte multi-idioma.

---

## 8. Referências Internas Importantes

- Documentação backend geral: [`README-BACKEND.md`](README-BACKEND.md)
- Guia detalhado de integração do fluxo de playback: [`Não sobe/backend_integration_guide.md`](Não sobe/backend_integration_guide.md)
- Arquivos de ambiente:
  - [`src/environments/environment.ts`](src/environments/environment.ts)
  - [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts)

---

Este README cobre a visão de alto nível e os detalhes dos módulos implementados no frontend, servindo como apoio direto para a escrita do TCC (capítulos de arquitetura, implementação, fluxos e integração).

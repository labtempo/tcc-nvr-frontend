# TCC NVR Frontend

Sistema frontend Angular para gerenciamento de câmeras e gravações NVR (Network Video Recorder). Este projeto implementa uma interface web para controle de câmeras IP e visualização de gravações VOD (Video on Demand) integrado com MediaMTX.

## Visão Geral do Sistema

### Arquitetura
- **Framework**: Angular 20.3.x
- **Arquitetura**: Standalone Components (sem módulos NgModule)
- **Estilo**: CSS puro
- **Backend API**: http://127.0.0.1:8000/api/v1
- **Autenticação**: JWT Bearer Token
- **Armazenamento**: LocalStorage para tokens e dados de usuário

### Estrutura de Pastas

```
src/app/
├── auth/                     # Módulo de autenticação
│   ├── login/               # Componente de login
│   ├── register/            # Componente de registro
│   ├── auth-guard.ts        # Guard de rotas protegidas
│   ├── auth.ts              # Serviço de autenticação
│   └── token-interceptor.ts # Interceptor HTTP para tokens
├── camera-list/             # Listagem de câmeras
├── camera-create/           # Criação de câmeras
├── camera-edit/             # Edição de câmeras
├── camera-view/             # Visualização de câmeras
├── camera.ts                # Serviço de câmeras
├── app.routes.ts            # Configuração de rotas
└── app.config.ts            # Configuração da aplicação
```

### Funcionalidades Implementadas

#### 1. **Sistema de Autenticação**
- **Login**: Componente para autenticação de usuários
- **Registro**: Cadastro de novos usuários
- **Auth Guard**: Proteção de rotas que requerem autenticação
- **Token Interceptor**: Inclusão automática de Bearer token em requisições HTTP
- **Auth Service**: Gerenciamento de tokens, login/logout e estado de autenticação

**Principais métodos do AuthService**:
```typescript
login(email: string, password: string): Observable<any>
register(email: string, fullName: string, password: string): Observable<any>
getToken(): string | null
isLoggedIn(): boolean
logout(): void
getUserId(): number | null
```

#### 2. **Gerenciamento de Câmeras**
- **Listagem**: Exibição de todas as câmeras do usuário
- **Criação**: Formulário para adicionar novas câmeras
- **Edição**: Modificação de câmeras existentes
- **Visualização**: Interface para assistir transmissão das câmeras
- **Exclusão**: Remoção de câmeras

**Principais métodos do CameraService**:
```typescript
getCameras(): Observable<any[]>             // Lista câmeras do usuário
createCamera(camera: any): Observable<any>   // Cria nova câmera
updateCamera(id: number, camera: any): Observable<any>
deleteCamera(id: number): Observable<any>
getCameraById(id: number): Observable<any>
```

#### 3. **Sistema de Rotas**
```typescript
{ path: 'login', component: LoginComponent },
{ path: 'register', component: RegisterComponent },
{ path: 'cameras', component: CameraListComponent, canActivate: [authGuard] },
{ path: 'cameras/create', component: CameraCreateComponent, canActivate: [authGuard] },
{ path: 'cameras/edit/:id', component: CameraEditComponent, canActivate: [authGuard] },
{ path: 'cameras/view/:id', component: CameraViewComponent, canActivate: [authGuard] },
{ path: '', redirectTo: '/login', pathMatch: 'full' },
```

### Tecnologias e Padrões Utilizados

#### **Angular Standalone Components**
- Todos os componentes são standalone (não utilizam NgModule)
- Imports diretos nos componentes
- Configuração via `app.config.ts`

#### **Interceptors HTTP**
- `TokenInterceptor`: Adiciona automaticamente o Bearer token em todas as requisições
- Configurado via `HTTP_INTERCEPTORS` no `app.config.ts`

#### **Guards de Rota**
- `authGuard`: Verifica se o usuário está autenticado
- Redireciona para `/login` se não autenticado
- Implementado como função (`CanActivateFn`)

#### **Gerenciamento de Estado**
- LocalStorage para persistência de tokens e dados do usuário
- Serviços injetáveis para gerenciamento de estado global
- RxJS Observables para comunicação assíncrona

### Fluxo de Autenticação

1. **Login**: Usuário fornece email/senha
2. **Token**: API retorna `access_token` e `user_id`
3. **Armazenamento**: Dados salvos no LocalStorage
4. **Interceptor**: Token incluído automaticamente em requisições
5. **Guards**: Rotas protegidas verificam presença do token
6. **Logout**: Remove dados do LocalStorage

### Integração com Backend

#### **Endpoints Utilizados**
```
POST /api/v1/login                    # Autenticação
POST /api/v1/usuarios                 # Registro
GET  /api/v1/camera/user/{userId}     # Câmeras do usuário
POST /api/v1/camera                   # Criar câmera
PUT  /api/v1/cameras/{id}             # Editar câmera
DELETE /api/v1/cameras/{id}           # Deletar câmera
GET  /api/v1/camera/{id}              # Detalhes da câmera
```

#### **Headers Padrão**
```typescript
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Próximas Implementações Sugeridas

Para implementar a funcionalidade de **listagem de gravações VOD** do MediaMTX:

1. **Novo Serviço**: `RecordingService` para integração com MediaMTX
2. **Novo Componente**: `CameraRecordingsComponent` para listar gravações
3. **Nova Rota**: `/cameras/:id/recordings`
4. **Player VOD**: Componente para reprodução de gravações
5. **Integração**: Endpoint do MediaMTX para listagem de gravações

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

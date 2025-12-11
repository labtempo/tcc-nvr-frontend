# Guia de Integração Backend - Frontend

Este documento serve como um guia técnico para a equipe de frontend integrar com a API do NVR.
**Atenção:** Uma análise profunda do código revelou que a documentação original (`api_flow_documentation.md`) está **desatualizada** em relação ao fluxo de Playback (Gravações). Siga este guia para a implementação correta.

## 1. Visão Geral da Arquitetura

O backend utiliza **FastAPI** e delega a gestão de vídeo para o **MediaMTX**.
- **Autenticação**: JWT (Bearer Token).
- **Live Streaming**: HLS e WebRTC gerados pelo MediaMTX.
- **Gravações**: Gerenciadas pelo MediaMTX e proxyadas pelo Backend.

## 2. Autenticação

Todas as rotas abaixo requerem o header:
`Authorization: Bearer <seu_token_jwt>`

## 3. Câmeras e Live Stream

Para obter a lista de câmeras e seus links de transmissão:

**Endpoint:** `GET /api/v1/camera/user/{user_id}`

**Resposta (Simplificada):**
```json
[
  {
    "id": 1,
    "name": "Câmera Garagem",
    "visualisation_url_hls": "http://<mediamtx_host>:8888/<path_id>/index.m3u8",
    ...
  }
]
```
> **Nota para Frontend**: Use o campo `visualisation_url_hls` para tocar o vídeo ao vivo usando um player HLS (ex: `hls.js` ou `video.js`).

---

## 4. Playback (Gravações) - O Fluxo Correto

A documentação antiga mencionava um endpoint `/records` e acesso direto a arquivos estáticos. **Esqueça esse fluxo.** O sistema implementado utiliza uma abordagem mais segura e dinâmica baseada em proxy reverso com o MediaMTX.

O fluxo de playback possui **3 passos obrigatórios**:

### Passo 1: Listar Segmentos de Gravação
Primeiro, obtenha os intervalos de tempo que possuem gravação para uma câmera específica.

- **Requisição**: `GET /api/v1/camera/{camera_id}/recordings`
- **Query Params Opcionais**: `start` (data ISO), `end` (data ISO)
- **O que faz**: Consulta a API interna do MediaMTX para listar os segmentos.

**Exemplo de Resposta:**
```json
[
  {
    "start": "2023-10-27T10:00:00Z",
    "duration": 3600
  },
  {
    "start": "2023-10-27T14:30:00Z",
    "duration": 1800
  }
]
```

### Passo 2: Obter URL de Playback Segura
O frontend **não acessa o arquivo de vídeo diretamente**. Você deve solicitar uma URL de playback "assinada".

- **Requisição**: `GET /api/v1/camera/{camera_id}/playback-url`
- **Query Params Obrigatórios**:
  - `start`: O timestamp de início do vídeo (obtido no Passo 1).
  - `duration`: A duração desejada em segundos.

**O que faz**: O backend gera um **Token Temporário** codificado com os dados do vídeo e retorna uma URL relativa apontando para o próprio backend.

**Exemplo de Resposta:**
```json
{
  "playbackUrl": "/api/v1/playback/video?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Passo 3: Reproduzir o Vídeo
Use a `playbackUrl` retornada no passo anterior como o `src` do seu player de vídeo HTML5.

- **URL**: `http://<backend_host>:8000/api/v1/playback/video?token=...`
- **Como funciona**:
  1. O Frontend chama essa URL.
  2. O Endpoint `/api/v1/playback/video` valida o token.
  3. O Backbone abre um stream HTTP com o MediaMTX.
  4. O vídeo é transmitido (streamed) para o frontend passo a passo, sem expor a infraestrutura interna.

### Exemplo de Código (Frontend / JS)

```javascript
async function playRecording(cameraId, recordingSegment) {
  // 1. Pegar a URL assinada
  const response = await fetch(\`/api/v1/camera/\${cameraId}/playback-url?start=\${recordingSegment.start}&duration=\${recordingSegment.duration}\`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await response.json();

  // 2. Montar a URL completa do backend
  const streamUrl = \`http://localhost:8000\${data.playbackUrl}\`;

  // 3. Setar no player
  const videoPlayer = document.getElementById('myVideoPlayer');
  videoPlayer.src = streamUrl;
  videoPlayer.play();
}
```

## Por que não está funcionando antes?
Provavelmente a equipe de frontend estava tentando:
1. Acessar `/api/v1/videos/{arquivo.mp4}` diretamente (o que exige saber o nome exato do arquivo, que é difícil de adivinhar).
2. Procurando pelo endpoint `GET /records` que **não existe** no código atual.

Adotem o fluxo listado acima (Listar -> Obter Token -> Stream) e o playback funcionará.

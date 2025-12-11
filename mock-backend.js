const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// --- Dados Mockados ---
// --- Dados Mockados ---
let cameras = [
  {
    id: 1,
    name: 'Entrada Principal',
    rtsp_url: 'rtsp://192.168.1.101:554/stream',
    visualisation_url_hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Public HLS test stream
    is_recording: true,
    created_by_user_Id: 1
  },
  {
    id: 2,
    name: 'Garagem Subsolo',
    rtsp_url: 'rtsp://192.168.1.102:554/stream',
    visualisation_url_hls: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    is_recording: true,
    created_by_user_Id: 1
  },
  {
    id: 3,
    name: 'Corredor Leste',
    rtsp_url: 'rtsp://192.168.1.103:554/stream',
    visualisation_url_hls: '', // Offline
    is_recording: false,
    created_by_user_Id: 1
  },
  {
    id: 4,
    name: 'Área Externa',
    rtsp_url: 'rtsp://192.168.1.104:554/stream',
    visualisation_url_hls: 'https://mnmedias.api.telequebec.tv/m3u8/29880.m3u8',
    is_recording: true,
    created_by_user_Id: 1
  }
];
let nextCameraId = 5;

// --- Endpoints ---

// POST /api/v1/login
app.post('/api/v1/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Tentativa de login com:', { email, password });

  if (email === 'test@test.com' && password === 'password') {
    console.log('Login bem-sucedido!');
    res.json({
      access_token: 'mock-jwt-token-12345',
      user_id: 1
    });
  } else {
    console.log('Falha no login: credenciais inválidas.');
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// POST /api/v1/usuarios (Registro)
app.post('/api/v1/usuarios', (req, res) => {
  console.log('Novo registro recebido:', req.body);
  res.status(201).json({ message: 'Usuário registrado com sucesso!', user: req.body });
});

// GET /api/v1/camera/user/:userId
app.get('/api/v1/camera/user/:userId', (req, res) => {
  console.log(`Buscando câmeras do usuário ${req.params.userId}`);
  res.json(cameras);
});

// GET /api/v1/camera/:id/recordings (Listar Segmentos)
app.get('/api/v1/camera/:id/recordings', (req, res) => {
  const { start } = req.query;
  console.log(`Buscando gravações da câmera ${req.params.id} a partir de ${start}`);

  // Mock de segmentos
  const segments = [
    { start: new Date().toISOString(), duration: 1800 }, // 30 min atrás
    { start: new Date(Date.now() - 3600000).toISOString(), duration: 3600 }, // 1 hora atrás
    { start: new Date(Date.now() - 7200000).toISOString(), duration: 900 }   // 15 min (2h atrás)
  ];

  res.json(segments);
});

// GET /api/v1/camera/:id/playback-url (Gerar Token)
app.get('/api/v1/camera/:id/playback-url', (req, res) => {
  console.log(`Gerando URL de playback para câmera ${req.params.id}`);
  const token = 'mock-token-' + Date.now();
  res.json({
    playbackUrl: `/api/v1/playback/video?token=${token}`
  });
});

// GET /api/v1/playback/video (Stream Mock)
app.get('/api/v1/playback/video', (req, res) => {
  // Redireciona para um vídeo MP4 público para simular o stream
  res.redirect('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

// CRUD Câmeras
app.get('/api/v1/camera/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const camera = cameras.find(c => c.id === id);
  if (camera) res.json(camera);
  else res.status(404).json({ error: 'Câmera não encontrada' });
});

app.post('/api/v1/camera', (req, res) => {
  const newCamera = { ...req.body, id: nextCameraId++, visualisation_url_hls: '' };
  cameras.push(newCamera);
  res.status(201).json(newCamera);
});

app.put('/api/v1/cameras/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = cameras.findIndex(c => c.id === id);
  if (index !== -1) {
    cameras[index] = { ...cameras[index], ...req.body };
    res.json(cameras[index]);
  } else {
    res.status(404).json({ error: 'Câmera não encontrada' });
  }
});

app.delete('/api/v1/cameras/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = cameras.findIndex(c => c.id === id);
  if (index !== -1) {
    cameras.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Câmera não encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Mock rodando em http://localhost:${PORT}`);
});

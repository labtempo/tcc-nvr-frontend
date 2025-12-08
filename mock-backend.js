const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// --- Dados Mockados ---
let cameras = [
  { id: 1, name: 'Câmera da Sala', rtsp_url: 'rtsp://example.com/stream1', is_recording: true, created_by_user_Id: 1 },
  { id: 2, name: 'Câmera do Quintal', rtsp_url: 'rtsp://example.com/stream2', is_recording: false, created_by_user_Id: 1 },
  { id: 3, name: 'Câmera da Garagem', rtsp_url: 'rtsp://example.com/stream3', is_recording: true, created_by_user_Id: 1 }
];
let nextCameraId = 4;

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
    const { userId } = req.params;
    console.log(`Buscando câmeras para o usuário: ${userId}`);
    res.json(cameras);
});

// GET /api/v1/camera/:id
app.get('/api/v1/camera/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`Buscando câmera com id: ${id}`);
    const camera = cameras.find(c => c.id === id);
    if (camera) {
        res.json(camera);
    } else {
        res.status(404).json({ error: 'Câmera não encontrada' });
    }
});

// POST /api/v1/camera
app.post('/api/v1/camera', (req, res) => {
    const newCamera = { ...req.body, id: nextCameraId++ };
    cameras.push(newCamera);
    console.log('Nova câmera criada:', newCamera);
    res.status(201).json(newCamera);
});

// PUT /api/v1/cameras/:id
app.put('/api/v1/cameras/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = cameras.findIndex(c => c.id === id);
    if (index !== -1) {
        cameras[index] = { ...cameras[index], ...req.body };
        console.log('Câmera atualizada:', cameras[index]);
        res.json(cameras[index]);
    } else {
        res.status(404).json({ error: 'Câmera não encontrada' });
    }
});

// DELETE /api/v1/cameras/:id
app.delete('/api/v1/cameras/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = cameras.findIndex(c => c.id === id);
    if (index !== -1) {
        cameras.splice(index, 1);
        console.log(`Câmera com id ${id} deletada.`);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Câmera não encontrada' });
    }
});


app.listen(PORT, () => {
  console.log(`Servidor backend mock rodando em http://localhost:${PORT}`);
});

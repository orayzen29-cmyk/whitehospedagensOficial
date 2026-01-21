const path = require('path');

// 1. Configura a pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rota para carregar o Login assim que abrir o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

const path = require('path');

// 1. Configura a pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rota para carregar o Login assim que abrir o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); // <-- Isso corrige o erro da foto!
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
// Forçar a abertura do login ao acessar o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
app.use(bodyParser.json());

// BANCO DE DADOS DE USUÁRIOS
const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

const activeProcesses = {};

// ROTA DE REGISTRO
app.post('/api/register', (req, res) => {
    const { user, pass } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    if (users.find(u => u.user === user)) return res.status(400).json({ error: 'Usuário já existe' });
    users.push({ user, pass });
    fs.writeFileSync(usersFile, JSON.stringify(users));
    res.json({ message: 'Registrado com sucesso' });
});

// ROTA DE LOGIN
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    const found = users.find(u => u.user === user && u.pass === pass);
    if (found) res.json({ success: true });
    else res.status(401).json({ error: 'Usuário ou senha incorretos' });
});

// --- GERENCIAMENTO DE BOTS ---
app.get('/api/bots', (req, res) => {
    const botsDir = path.join(__dirname, 'bots');
    if (!fs.existsSync(botsDir)) fs.mkdirSync(botsDir);
    const bots = fs.readdirSync(botsDir).map(botName => ({
        name: botName,
        status: activeProcesses[botName] ? 'online' : 'offline'
    }));
    res.json(bots);
});


// FORÇAR LOGIN AO ACESSAR A RAIZ DO SITE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
app.post('/api/bots', (req, res) => {
    const { name, token, code } = req.body;
    const botPath = path.join(__dirname, 'bots', name);
    if (fs.existsSync(botPath)) return res.status(400).json({ error: 'Bot já existe' });
    fs.mkdirSync(botPath);
    const mainCode = `const { Client, GatewayIntentBits } = require('discord.js');\nconst client = new Client({ intents: [GatewayIntentBits.Guilds] });\nconst TOKEN = "${token}";\n${code}\nclient.login(TOKEN);`;
    fs.writeFileSync(path.join(botPath, 'index.js'), mainCode);
    fs.writeFileSync(path.join(botPath, 'package.json'), JSON.stringify({ name, main: "index.js", dependencies: { "discord.js": "^14.11.0" } }));
    res.json({ message: 'Bot criado' });
});

app.post('/api/bots/:name/start', (req, res) => {
    const { name } = req.params;
    const botPath = path.join(__dirname, 'bots', name);
    const child = spawn('node', ['index.js'], { cwd: botPath });
    activeProcesses[name] = child;
    child.on('close', () => delete activeProcesses[name]);
    res.json({ status: 'online' });
});

app.post('/api/bots/:name/stop', (req, res) => {
    const { name } = req.params;
    if (activeProcesses[name]) { activeProcesses[name].kill(); delete activeProcesses[name]; }
    res.json({ status: 'offline' });
});

app.delete('/api/bots/:name', (req, res) => {
    const { name } = req.params;
    if (activeProcesses[name]) { activeProcesses[name].kill(); delete activeProcesses[name]; }
    const botPath = path.join(__dirname, 'bots', name);
    if (fs.existsSync(botPath)) fs.rmSync(botPath, { recursive: true, force: true });
    res.json({ message: 'Deletado' });
});


app.listen(PORT, () => console.log(`🚀 White Hospedagens ON: http://localhost:${PORT}`));

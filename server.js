const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware para processar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de arquivos estáticos (HTML, CSS, JS do front-end)
// Isso resolve o erro "Not Found" ao procurar a pasta public
app.use(express.static(path.join(__dirname, 'public')));

const usersFile = path.join(__dirname, 'users.json');

// Garante que o arquivo de usuários existe
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}

// --- ROTAS DE NAVEGAÇÃO ---

// Página Inicial (Login/Registro)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Painel de Controle
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- ROTAS DE API (Lógica) ---

// Registro de Usuário
app.post('/api/register', (req, res) => {
    try {
        const { user, pass } = req.body;
        const data = fs.readFileSync(usersFile);
        const users = JSON.parse(data);

        if (users.find(u => u.user === user)) {
            return res.status(400).json({ error: 'Este usuário já existe!' });
        }

        users.push({ user, pass });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        res.json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao registrar.' });
    }
});

// Login de Usuário
app.post('/api/login', (req, res) => {
    try {
        const { user, pass } = req.body;
        const data = fs.readFileSync(usersFile);
        const users = JSON.parse(data);

        const found = users.find(u => u.user === user && u.pass === pass);
        if (found) {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao logar.' });
    }
});

// --- INICIALIZAÇÃO ---

// A porta deve ser dinâmica para a Render (process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 White Hospedagens rodando na porta ${PORT}`);
});

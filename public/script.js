// ISSO DEVE SER A PRIMEIRA COISA NO SCRIPT.JS
if (localStorage.getItem('logged') !== 'true') {
    window.location.href = 'auth.html';
}

// Verifica se o usuário está logado
if (localStorage.getItem('logged') !== 'true') {
    window.location.href = 'auth.html';
}

// Função de Logout (Adicione um botão no HTML se desejar)
function logout() {
    localStorage.removeItem('logged');
    window.location.href = 'auth.html';
}

const grid = document.getElementById('bot-grid');

// Carregar bots ao iniciar
async function loadBots() {
    const res = await fetch('/api/bots');
    const bots = await res.json();
    grid.innerHTML = '';
    
    bots.forEach(bot => {
        const card = document.createElement('div');
        card.className = 'bot-card';
        card.innerHTML = `
            <div class="bot-header">
                <h3>${bot.name}</h3>
                <span class="bot-status ${bot.status}">${bot.status}</span>
            </div>
            <div class="bot-info">
                <small>Node.js Environment</small>
            </div>
            <div class="controls">
                ${bot.status === 'offline' 
                    ? `<button class="btn-start" onclick="controlBot('${bot.name}', 'start')"><i class="fa-solid fa-play"></i> Ligar</button>` 
                    : `<button class="btn-stop" onclick="controlBot('${bot.name}', 'stop')"><i class="fa-solid fa-stop"></i> Parar</button>`
                }
                <button class="btn-delete" onclick="deleteBot('${bot.name}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Controlar Bot (Ligar/Desligar)
async function controlBot(name, action) {
    const res = await fetch(`/api/bots/${name}/${action}`, { method: 'POST' });
    if(res.ok) loadBots();
    else alert('Erro ao executar ação');
}

// Deletar Bot
async function deleteBot(name) {
    if(!confirm('Tem certeza que deseja deletar este bot?')) return;
    const res = await fetch(`/api/bots/${name}`, { method: 'DELETE' });
    if(res.ok) loadBots();
}

// Criar Bot
document.getElementById('createBotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('botName').value.replace(/\s+/g, '-');
    const token = document.getElementById('botToken').value;
    const code = document.getElementById('botCode').value;

    const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, token, code })
    });

    if(res.ok) {
        closeModal();
        loadBots();
        e.target.reset();
    } else {
        alert('Erro ao criar bot (Nome duplicado?)');
    }
});

// Modal Logic
function openModal() { document.getElementById('modal').style.display = 'block'; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

loadBots();
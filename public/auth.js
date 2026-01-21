let isLogin = true;

const authTitle = document.getElementById('auth-title');
const btnAuth = document.getElementById('btn-auth');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const authForm = document.getElementById('authForm');

// Alternar entre Login e Registro
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    
    authTitle.innerText = isLogin ? 'Login' : 'Registro';
    btnAuth.innerText = isLogin ? 'Entrar' : 'Criar Conta';
    toggleText.innerText = isLogin ? 'Não tem conta?' : 'Já tem conta?';
    toggleLink.innerText = isLogin ? 'Registre-se' : 'Fazer Login';
    authForm.reset();
});

// Envio dos dados para o servidor (Render)
authForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    
    // Rota dinâmica (funciona tanto local quanto na Render)
    const route = isLogin ? '/api/login' : '/api/register';

    try {
        const res = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await res.json();

        if (res.ok) {
            if (isLogin) {
                // Salva o estado de login no navegador
                localStorage.setItem('logged', 'true');
                localStorage.setItem('username', user);
                // Redireciona para o painel
                window.location.href = 'index.html';
            } else {
                alert('✅ Conta criada! Agora faça seu login.');
                toggleLink.click(); // Volta para a tela de login
            }
        } else {
            alert('❌ Erro: ' + (data.error || 'Falha ao processar'));
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
        alert('❌ Erro de conexão com o servidor.');
    }
};

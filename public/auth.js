let isLogin = true;

const toggleLink = document.getElementById('toggle-link');
const authTitle = document.getElementById('auth-title');
const btnAuth = document.getElementById('btn-auth');
const toggleText = document.getElementById('toggle-text');

// FUNÇÃO PARA TROCAR ENTRE LOGIN E REGISTRO
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    
    authTitle.innerText = isLogin ? 'Login' : 'Registro';
    btnAuth.innerText = isLogin ? 'Entrar' : 'Criar Conta';
    toggleText.innerText = isLogin ? 'Não tem conta?' : 'Já tem conta?';
    toggleLink.innerText = isLogin ? 'Registre-se' : 'Fazer Login';
});

// ENVIO DO FORMULÁRIO
document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    const route = isLogin ? '/api/login' : '/api/register';

    const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
    });

    if (res.ok) {
        if (isLogin) {
            localStorage.setItem('logged', 'true');
            window.location.href = 'index.html';
        } else {
            alert('Conta criada! Agora faça o login.');
            isLogin = true; // Volta para o estado de login
            location.reload(); // Recarrega para limpar os campos
        }
    } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao processar');
    }
};
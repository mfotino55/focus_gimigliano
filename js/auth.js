// Funzioni UI per l'autenticazione
window.showRegistration = function() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registrationForm').classList.remove('hidden');
    clearAuthMessages();
}

window.showLogin = function() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registrationForm').classList.add('hidden');
    clearAuthMessages();
}

window.login = function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showErrorMessage('Inserisci username e password');
        return;
    }

    const rilevatore = state.rilevatori.find(r =>
        r.username === username && r.password === password);

    if (rilevatore) {
        state.currentUser = rilevatore;
        localStorage.setItem('currentUser', JSON.stringify(rilevatore));
        showSuccessMessage('Login effettuato con successo');
        updateUI();
        resetAuthForms();
    } else {
        showErrorMessage('Credenziali non valide');
    }
}

window.register = function() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    const nome = document.getElementById('nome').value;
    const cognome = document.getElementById('cognome').value;

    if (!username || !password || !email || !nome || !cognome) {
        showErrorMessage('Compila tutti i campi');
        return;
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorMessage('Inserisci un indirizzo email valido');
        return;
    }

    if (state.rilevatori.some(r => r.username === username)) {
        showErrorMessage('Username già in uso');
        return;
    }

    if (state.rilevatori.some(r => r.email === email)) {
        showErrorMessage('Email già registrata');
        return;
    }

    const newRilevatore = {
        username,
        password,
        email,
        nome,
        cognome,
        isAdmin: state.rilevatori.length === 0, // Il primo rilevatore diventa admin
        dataRegistrazione: new Date().toISOString()
    };

    state.rilevatori.push(newRilevatore);
    saveToLocalStorage();
    showSuccessMessage('Registrazione completata con successo');
    resetAuthForms();
    showLogin();
}

// Funzioni di supporto
function resetAuthForms() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('cognome').value = '';
}

function clearAuthMessages() {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = '';
        authMessage.style.display = 'none';
    }
}

// Il resto delle funzioni rimane uguale...

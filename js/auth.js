// Sistema di autenticazione e autorizzazioni
function login() {
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

function register() {
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

function logout() {
    if (confirm('Sei sicuro di voler effettuare il logout?')) {
        state.currentUser = null;
        localStorage.removeItem('currentUser');
        updateUI();
        resetAuthForms();
        showLogin();
    }
}

function updateUI() {
    const authSection = document.getElementById('authSection');
    const mainContent = document.getElementById('mainContent');
    const adminTab = document.querySelector('[data-tab="admin"]');
    const userDisplay = document.getElementById('userDisplay');

    if (state.currentUser) {
        authSection.classList.add('hidden');
        mainContent.classList.remove('hidden');

        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        const homeButton = document.querySelector('[data-tab="home"]');
        const homeTab = document.getElementById('homeTab');
        if (homeButton && homeTab) {
            homeButton.classList.add('active');
            homeTab.classList.add('active');
        }

        userDisplay.textContent = `${state.currentUser.nome} ${state.currentUser.cognome}`;

        if (state.currentUser.isAdmin) {
            adminTab.style.display = 'block';
            updateRilevatoriList();
            updateReport();
        } else {
            adminTab.style.display = 'none';
        }

        const rilevatoreInput = document.getElementById('rilevatore');
        if (rilevatoreInput) {
            rilevatoreInput.value = `${state.currentUser.nome} ${state.currentUser.cognome}`;
            rilevatoreInput.disabled = true;
        }

        updateDashboard();
    } else {
        authSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }
}

function updateDashboard() {
    if (!isAuthenticated()) return;

    const container = document.getElementById('ultimeRilevazioni');
    if (!container) return;

    const userRilevazioni = state.risultati
        .filter(r => r.rilevatore === state.currentUser.username)
        .slice(-5)
        .reverse();

    if (userRilevazioni.length === 0) {
        container.innerHTML = '<p>Non hai ancora effettuato rilevazioni</p>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Quartiere</th>
                    <th>Area</th>
                </tr>
            </thead>
            <tbody>
                ${userRilevazioni.map(r => `
                    <tr>
                        <td>${new Date(r.dataRilevazione).toLocaleDateString()}</td>
                        <td>${r.quartiere}</td>
                        <td>${r.area}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function checkPermissions(requiredPermission) {
    if (!isAuthenticated()) {
        showErrorMessage('Devi effettuare il login per accedere a questa funzionalità');
        return false;
    }
    if (requiredPermission === 'admin' && !isAdmin()) {
        showErrorMessage('Non hai i permessi necessari per questa operazione');
        return false;
    }
    return true;
}

function isAuthenticated() {
    return state.currentUser !== null;
}

function isAdmin() {
    return state.currentUser?.isAdmin === true;
}
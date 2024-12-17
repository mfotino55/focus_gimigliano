// Stato dell'applicazione
const state = {
    currentUser: null,
    rilevatori: [], // Includerà anche l'email
    risultati: [],
    chartInstances: {
        pie: null,
        bar: null
    }
};

// Configurazione domande
const domande = {
    identita: [
        "Qual è la storia del tuo quartiere?",
        "Come percepisci le relazioni interne nel quartiere?",
        "Quali sono gli obiettivi futuri del quartiere?",
        "Note del rilevatore"
    ],
    servizi: [
        "Quali servizi sono disponibili nel quartiere?",
        "Quali sono le principali carenze?",
        "Quali proposte di miglioramento suggeriresti?",
        "Note del rilevatore"
    ],
    partecipazione: [
        "Quali esperienze hai avuto con la partecipazione civica?",
        "Cosa potrebbe incentivare una maggiore partecipazione?",
        "Quali strumenti di partecipazione ritieni utili?",
        "Note del rilevatore"
    ],
    consulte: [
        "Qual è il tuo rapporto con l'amministrazione comunale?",
        "Come immagini l'organizzazione delle consulte?",
        "Quali funzioni dovrebbero avere le consulte?",
        "Note del rilevatore"
    ]
};

// Configurazione sentiment
const sentimentOptions = {
    POSITIVO: [
        "Soddisfazione", "Fiducia", "Speranza", "Ottimismo",
        "Coinvolgimento", "Entusiasmo", "Motivazione", "Apprezzamento"
    ],
    NEUTRO: [
        "Indifferenza", "Incertezza", "Attesa", "Curiosità",
        "Riflessione", "Apatia", "Prudenza", "Perplessità"
    ],
    NEGATIVO: [
        "Frustrazione", "Sfiducia", "Rabbia", "Delusione",
        "Scetticismo", "Preoccupazione", "Disillusione", "Impotenza"
    ]
};

// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Funzioni di inizializzazione
function initializeApp() {
    loadFromLocalStorage();
    setupTabNavigation();
    
    const savedSession = localStorage.getItem('currentUser');
    if (savedSession) {
        state.currentUser = JSON.parse(savedSession);
        updateUI();
    }
}

// Setup degli event listener
function setupEventListeners() {
    const areaSelect = document.getElementById('area-tipo');
    if (areaSelect) {
        areaSelect.addEventListener('change', updateDomande);
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });

    document.querySelectorAll('.admin-nav-button').forEach(button => {
        button.addEventListener('click', () => switchAdminSection(button));
    });
}

// Funzioni di storage
function loadFromLocalStorage() {
    const savedRilevatori = localStorage.getItem('rilevatori');
    const savedRisultati = localStorage.getItem('risultati');
    
    if (savedRilevatori) state.rilevatori = JSON.parse(savedRilevatori);
    if (savedRisultati) state.risultati = JSON.parse(savedRisultati);
}

function saveToLocalStorage() {
    localStorage.setItem('rilevatori', JSON.stringify(state.rilevatori));
    localStorage.setItem('risultati', JSON.stringify(state.risultati));
}

// Funzioni di utility per i messaggi
function showErrorMessage(message) {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = 'debug-info error';
        authMessage.style.display = 'block';
    }
}

function showSuccessMessage(message) {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = 'debug-info success';
        authMessage.style.display = 'block';
    }
}

// Funzioni di navigazione
function switchTab(button) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab') + 'Tab';
    document.getElementById(tabId).classList.add('active');
}

function switchAdminSection(button) {
    document.querySelectorAll('.admin-nav-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    
    button.classList.add('active');
    const sectionId = button.getAttribute('data-section') + 'Section';
    document.getElementById(sectionId).classList.add('active');
}

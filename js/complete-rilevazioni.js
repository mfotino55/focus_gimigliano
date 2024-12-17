// Gestione delle rilevazioni
function updateDomande() {
    if (!checkAuth()) return;

    const area = document.getElementById('area-tipo').value;
    const container = document.getElementById('domande-container');
    container.innerHTML = '';

    if (!area || !domande[area]) return;

    domande[area].forEach((domanda, index) => {
        const isNoteRilevatore = domanda === "Note del rilevatore";
        const questionCard = document.createElement('div');

        if (isNoteRilevatore) {
            questionCard.className = 'question-card note-rilevatore';
            questionCard.innerHTML = `
                <h3>${domanda}</h3>
                <textarea rows="6" 
                    placeholder="Inserisci qui le tue osservazioni, impressioni e note aggiuntive sulla rilevazione...">
                </textarea>
            `;
        } else {
            questionCard.className = 'question-card';
            questionCard.innerHTML = `
                <h3>${domanda}</h3>
                <textarea rows="4" placeholder="Risposta"></textarea>
                <select class="sentiment-select" onchange="updateSecondSelect(this)">
                    <option value="">Seleziona categoria sentiment</option>
                    ${Object.keys(sentimentOptions).map(categoria =>
                        `<option value="${categoria}">${categoria}</option>`
                    ).join('')}
                </select>
                <select class="sentiment-specifico" style="display:none;">
                    <option value="">Seleziona sentiment specifico</option>
                </select>
            `;
        }
        container.appendChild(questionCard);
    });
}

function updateSecondSelect(selectElement) {
    const categoria = selectElement.value;
    const secondSelect = selectElement.nextElementSibling;

    if (categoria) {
        secondSelect.style.display = 'inline-block';
        secondSelect.innerHTML = `
            <option value="">Seleziona sentiment specifico</option>
            ${sentimentOptions[categoria].map(sentiment =>
                `<option value="${sentiment}">${sentiment}</option>`
            ).join('')}
        `;
    } else {
        secondSelect.style.display = 'none';
    }
}

function salvaDati() {
    if (!checkAuth()) return;

    const area = document.getElementById('area-tipo').value;
    const dataRilevazione = document.getElementById('data-rilevazione').value;
    const quartiere = document.getElementById('quartiere').value;

    if (!dataRilevazione || !quartiere || !area) {
        showErrorMessage('Compilare tutti i campi obbligatori');
        return;
    }

    try {
        const risposte = Array.from(document.querySelectorAll('#domande-container .question-card')).map(card => {
            const isNoteRilevatore = card.classList.contains('note-rilevatore');
            const risposta = card.querySelector('textarea').value;

            if (!isNoteRilevatore && !risposta.trim()) {
                throw new Error('Tutte le domande devono avere una risposta');
            }

            return {
                domanda: card.querySelector('h3').textContent,
                risposta: risposta,
                sentiment: isNoteRilevatore ? null : card.querySelector('.sentiment-specifico').value
            };
        });

        const rilevazione = {
            id: Date.now(),
            rilevatore: state.currentUser.username,
            nomeRilevatore: `${state.currentUser.nome} ${state.currentUser.cognome}`,
            dataRilevazione,
            quartiere,
            area,
            risposte,
            timestamp: new Date().toISOString()
        };

        const errori = validaRilevazione(rilevazione);
        if (errori.length > 0) {
            showErrorMessage(`Errori nella rilevazione:\n${errori.join('\n')}`);
            return;
        }

        state.risultati.push(rilevazione);
        saveToLocalStorage();
        showSuccessMessage('Rilevazione salvata con successo');

        if (state.currentUser.isAdmin) {
            updateReport();
        }
        updateDashboard();
        pulisciForm();
    } catch (error) {
        showErrorMessage(error.message);
    }
}

function validaRilevazione(rilevazione) {
    const errori = [];
    if (!rilevazione.dataRilevazione) errori.push('Data rilevazione mancante');
    if (!rilevazione.quartiere) errori.push('Quartiere mancante');
    if (!rilevazione.area) errori.push('Area mancante');

    rilevazione.risposte.forEach((risposta, index) => {
        if (!risposta.risposta.trim() && !risposta.domanda.includes('Note del rilevatore')) {
            errori.push(`Risposta mancante alla domanda ${index + 1}`);
        }
    });

    return errori;
}

function scaricaDati() {
    if (!checkAuth()) return;

    let datiDaScaricare = state.currentUser.isAdmin ? 
        state.risultati : 
        state.risultati.filter(r => r.rilevatore === state.currentUser.username);

    if (datiDaScaricare.length === 0) {
        showErrorMessage('Nessun dato da scaricare');
        return;
    }

    const filename = state.currentUser.isAdmin ?
        `tutte-le-rilevazioni-${new Date().toISOString().split('T')[0]}.json` :
        `rilevazioni-${state.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;

    const blob = new Blob([JSON.stringify(datiDaScaricare, null, 2)], {
        type: 'application/json'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    showSuccessMessage('Download completato');
}

function pulisciForm() {
    document.getElementById('data-rilevazione').value = '';
    document.getElementById('quartiere').value = '';
    document.getElementById('area-tipo').value = '';
    document.getElementById('domande-container').innerHTML = '';
}

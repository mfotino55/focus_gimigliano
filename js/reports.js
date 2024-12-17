// Sistema di reporting e analisi
const reports = {
    // Aggiornamento report principale
    updateReport: function() {
        if (!checkPermissions('admin')) return;

        const container = document.getElementById('reportSection');
        if (!container) return;

        const analisi = this.analizzaDati();
        container.innerHTML = this.generaReport(analisi);

        setTimeout(() => {
            this.createCharts(analisi);
        }, 100);
    },

    // Analisi dei dati
    analizzaDati: function() {
        const analisi = {
            sentiment: {
                POSITIVO: 0,
                NEUTRO: 0,
                NEGATIVO: 0
            },
            perQuartiere: {},
            perArea: {},
            perRilevatore: {},
            totaleRilevazioni: state.risultati.length,
            quartieriUnici: new Set(state.risultati.map(r => r.quartiere)),
            areeUniche: new Set(state.risultati.map(r => r.area)),
            periodoAnalisi: {
                inizio: null,
                fine: null
            }
        };

        if (state.risultati.length > 0) {
            const date = state.risultati.map(r => new Date(r.dataRilevazione));
            analisi.periodoAnalisi.inizio = new Date(Math.min(...date));
            analisi.periodoAnalisi.fine = new Date(Math.max(...date));
        }

        state.risultati.forEach(risultato => {
            this.elaboraRisultato(risultato, analisi);
        });

        return analisi;
    },

    // Elaborazione singolo risultato
    elaboraRisultato: function(risultato, analisi) {
        // Inizializza strutture se non esistono
        if (!analisi.perQuartiere[risultato.quartiere]) {
            analisi.perQuartiere[risultato.quartiere] = {
                totaleRisposte: 0,
                sentiment: { POSITIVO: 0, NEUTRO: 0, NEGATIVO: 0 }
            };
        }

        if (!analisi.perArea[risultato.area]) {
            analisi.perArea[risultato.area] = {
                totaleRisposte: 0,
                sentiment: { POSITIVO: 0, NEUTRO: 0, NEGATIVO: 0 }
            };
        }

        if (!analisi.perRilevatore[risultato.rilevatore]) {
            analisi.perRilevatore[risultato.rilevatore] = {
                nome: risultato.nomeRilevatore,
                totaleRilevazioni: 0,
                sentiment: { POSITIVO: 0, NEUTRO: 0, NEGATIVO: 0 }
            };
        }

        // Analisi delle risposte
        risultato.risposte.forEach(risposta => {
            if (risposta.sentiment) {
                const categoria = determinaCategoriaSentiment(risposta.sentiment);
                analisi.sentiment[categoria]++;
                analisi.perQuartiere[risultato.quartiere].sentiment[categoria]++;
                analisi.perArea[risultato.area].sentiment[categoria]++;
                analisi.perRilevatore[risultato.rilevatore].sentiment[categoria]++;
            }
        });

        // Aggiorna contatori
        analisi.perQuartiere[risultato.quartiere].totaleRisposte++;
        analisi.perArea[risultato.area].totaleRisposte++;
        analisi.perRilevatore[risultato.rilevatore].totaleRilevazioni++;
    },

    // Creazione grafici
    createCharts: function(analisi) {
        // Distruggi grafici esistenti
        if (state.chartInstances.pie) state.chartInstances.pie.destroy();
        if (state.chartInstances.bar) state.chartInstances.bar.destroy();

        this.createPieChart(analisi);
        this.createBarChart(analisi);
    },

    // Grafico a torta per sentiment
    createPieChart: function(analisi) {
        const pieCtx = document.getElementById('pieChart')?.getContext('2d');
        if (!pieCtx) return;

        state.chartInstances.pie = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Positivo', 'Neutro', 'Negativo'],
                datasets: [{
                    data: [
                        analisi.sentiment.POSITIVO,
                        analisi.sentiment.NEUTRO,
                        analisi.sentiment.NEGATIVO
                    ],
                    backgroundColor: ['#27ae60', '#f1c40f', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    },

    // Esportazione report
    esportaReport: function() {
        if (!checkPermissions('admin')) return;

        html2canvas(document.querySelector('.report-container'))
            .then(canvas => {
                const link = document.createElement('a');
                link.download = `report-rilevazioni-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL();
                link.click();
                showSuccessMessage('Report esportato con successo');
            })
            .catch(error => {
                console.error('Errore durante l\'esportazione:', error);
                showErrorMessage('Errore durante l\'esportazione del report');
            });
    }
};

// Esporta le funzioni per l'uso globale
window.updateReport = reports.updateReport.bind(reports);
window.esportaReport = reports.esportaReport.bind(reports);

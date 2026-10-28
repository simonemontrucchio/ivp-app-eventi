
document.addEventListener('DOMContentLoaded', () => {
    const producers = eventData.producers;
    
    // State
    let activeFilters = {
        text: '',
        barolo: false,
        bio: false,
        seeking: false,
        type: ''
    };
    
    let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
    let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

    // Elements
    const grid = document.getElementById('producer-list');
    const searchInput = document.getElementById('search-input');
    const btnBarolo = document.getElementById('filter-barolo');
    const btnBio = document.getElementById('filter-bio');
    const btnSeeking = document.getElementById('filter-seeking');
    const selectType = document.getElementById('filter-type');
    const notebookCount = document.getElementById('notebook-count');
    
    // Modals
    const modalProducer = document.getElementById('modal-producer');
    const modalNotebook = document.getElementById('modal-notebook');
    const modalInfo = document.getElementById('modal-info');
    
    // Init
    updateNotebookCount();
    renderProducers();

    // Event Listeners - Filters
    searchInput.addEventListener('input', (e) => { activeFilters.text = e.target.value.toLowerCase(); renderProducers(); });
    btnBarolo.addEventListener('click', () => { activeFilters.barolo = !activeFilters.barolo; btnBarolo.classList.toggle('active'); renderProducers(); });
    btnBio.addEventListener('click', () => { activeFilters.bio = !activeFilters.bio; btnBio.classList.toggle('active'); renderProducers(); });
    btnSeeking.addEventListener('click', () => { activeFilters.seeking = !activeFilters.seeking; btnSeeking.classList.toggle('active'); renderProducers(); });
    selectType.addEventListener('change', (e) => { activeFilters.type = e.target.value; renderProducers(); });

    // Header buttons
    document.getElementById('btn-info').addEventListener('click', () => modalInfo.showModal());
    document.getElementById('btn-notebook').addEventListener('click', () => {
        renderNotebook();
        modalNotebook.showModal();
    });

    // Close Modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById(e.target.dataset.close).close();
        });
    });

    function getEnotourismIcon(type) {
        const icons = {
            'accommodation': '🛏️',
            'restaurant': '🍴',
            'pool': '🏊',
            'vineyard': '🚶'
        };
        return icons[type] || '✨';
    }

    function renderProducers() {
        grid.innerHTML = '';
        
        let filtered = producers.filter(p => {
            // Text search (name, region, wines)
            let matchText = true;
            if (activeFilters.text) {
                const searchStr = `${p.name} ${p.region} ${p.wines.map(w=>w.name).join(' ')}`.toLowerCase();
                matchText = searchStr.includes(activeFilters.text);
            }
            
            // Seeking
            let matchSeeking = activeFilters.seeking ? (p.market === 'seeking') : true;
            
            // Barolo (check if any wine contains "Barolo")
            let matchBarolo = activeFilters.barolo ? p.wines.some(w => w.name.toLowerCase().includes('barolo')) : true;
            
            // Bio (check if any wine is organic)
            let matchBio = activeFilters.bio ? p.wines.some(w => w.organic) : true;
            
            // Type (check if any wine matches type)
            let matchType = activeFilters.type ? p.wines.some(w => w.type === activeFilters.type) : true;
            
            return matchText && matchSeeking && matchBarolo && matchBio && matchType;
        });

        if(filtered.length === 0) {
            grid.innerHTML = '<p style="padding: 20px; color: #666;">No producers found matching the filters.</p>';
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'producer-card';
            
            let marketBadge = p.market === 'seeking' 
                ? `<span class="badge seeking">Seeking Importer</span>` 
                : `<span class="badge imported">Importer: ${p.importer}</span>`;

            card.innerHTML = `
                <div class="pc-header">
                    <div class="pc-title">${p.name}</div>
                    <div class="badge dark">Desk ${p.desk}</div>
                </div>
                <div class="pc-meta">${p.region}, ${p.city}</div>
                <div style="margin-bottom: 10px;">${marketBadge}</div>
                <div class="pc-wines">${p.wines.length} wines in tasting</div>
            `;
            
            card.addEventListener('click', () => openProducerModal(p));
            grid.appendChild(card);
        });
    }

    function openProducerModal(p) {
        document.getElementById('mp-name').textContent = p.name;
        document.getElementById('mp-desk').textContent = `Desk ${p.desk}`;
        document.getElementById('mp-region').textContent = `${p.region}, ${p.city}`;
        document.getElementById('mp-contact').textContent = `${p.contactName} (${p.contactRole})`;
        
        const emailBtn = document.getElementById('mp-email');
        emailBtn.href = `mailto:${p.email}`;
        
        let marketText = p.market === 'seeking' ? 'Seeking Importer' : `Imported by ${p.importer}`;
        document.getElementById('mp-market-status').textContent = marketText;

        // Icons
        const iconsContainer = document.getElementById('mp-icons');
        iconsContainer.innerHTML = '';
        if (p.icons && p.icons.length > 0) {
            p.icons.forEach(iconType => {
                const div = document.createElement('div');
                div.className = 'eno-icon';
                div.textContent = getEnotourismIcon(iconType);
                div.title = iconType.charAt(0).toUpperCase() + iconType.slice(1);
                iconsContainer.appendChild(div);
            });
        }

        // Wines
        const winesContainer = document.getElementById('mp-wines');
        winesContainer.innerHTML = '';
        
        p.wines.forEach(w => {
            const wDiv = document.createElement('div');
            wDiv.className = 'wine-item';
            
            let exclusiveHtml = w.masterclassExclusive ? `<span class="exclusive-badge">Masterclass Exclusive</span><br>` : '';
            let organicHtml = w.organic ? `<span title="Organic Wine">🍇</span> ` : '';
            let isSaved = !!savedWines[w.id];
            
            wDiv.innerHTML = `
                <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                    ${isSaved ? '♥️' : '♡'}
                </button>
                <div class="wine-header">
                    <div>
                        ${exclusiveHtml}
                        <div class="wine-name">${organicHtml}${w.name}</div>
                        <div class="wine-meta">${w.vintage} &bull; ${w.type}</div>
                    </div>
                </div>
                <textarea class="wine-note-input" data-wine-id="${w.id}" placeholder="Tasting notes...">${wineNotes[w.id] || ''}</textarea>
            `;
            
            winesContainer.appendChild(wDiv);
        });

        // Attach listeners for hearts and notes
        attachWineListeners(winesContainer, p);
        
        modalProducer.showModal();
    }

    function attachWineListeners(container, pData = null) {
        container.querySelectorAll('.heart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wineId = e.currentTarget.dataset.wineId;
                if (savedWines[wineId]) {
                    delete savedWines[wineId];
                    e.currentTarget.classList.remove('active');
                    e.currentTarget.textContent = '♡';
                } else {
                    // Save minimal data to reconstruct in notebook
                    savedWines[wineId] = true;
                    e.currentTarget.classList.add('active');
                    e.currentTarget.textContent = '♥️';
                }
                localStorage.setItem('bf_savedWines', JSON.stringify(savedWines));
                updateNotebookCount();
            });
        });

        container.querySelectorAll('.wine-note-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const wineId = e.currentTarget.dataset.wineId;
                wineNotes[wineId] = e.target.value;
                localStorage.setItem('bf_wineNotes', JSON.stringify(wineNotes));
                
                // Auto-favorite if they write a note
                if(e.target.value.trim() !== '' && !savedWines[wineId]) {
                    savedWines[wineId] = true;
                    localStorage.setItem('bf_savedWines', JSON.stringify(savedWines));
                    updateNotebookCount();
                    // Update the heart button visually
                    const heartBtn = e.currentTarget.parentElement.querySelector('.heart-btn');
                    if(heartBtn) {
                        heartBtn.classList.add('active');
                        heartBtn.textContent = '♥️';
                    }
                }
            });
        });
    }

    function updateNotebookCount() {
        notebookCount.textContent = Object.keys(savedWines).length;
    }

    function renderNotebook() {
        const container = document.getElementById('notebook-list');
        container.innerHTML = '';
        
        const savedIds = Object.keys(savedWines);
        if (savedIds.length === 0) {
            container.innerHTML = '<p>No wines saved yet. Explore the producers and tap the heart icon!</p>';
            return;
        }

        // Find wines from global data
        savedIds.forEach(id => {
            // Brute force find for prototype
            let foundWine = null;
            let foundProducer = null;
            
            producers.forEach(p => {
                p.wines.forEach(w => {
                    if(w.id === id) {
                        foundWine = w;
                        foundProducer = p;
                    }
                });
            });

            if (foundWine) {
                const wDiv = document.createElement('div');
                wDiv.className = 'wine-item';
                let organicHtml = foundWine.organic ? `<span>🍇</span> ` : '';
                
                wDiv.innerHTML = `
                    <button class="heart-btn active" data-wine-id="${foundWine.id}">♥️</button>
                    <div class="wine-header">
                        <div>
                            <div class="wine-meta" style="color:var(--brand-red); font-weight:bold; margin-bottom:4px;">${foundProducer.name}</div>
                            <div class="wine-name">${organicHtml}${foundWine.name}</div>
                            <div class="wine-meta">${foundWine.vintage} &bull; ${foundWine.type}</div>
                        </div>
                    </div>
                    <textarea class="wine-note-input" data-wine-id="${foundWine.id}" placeholder="Tasting notes...">${wineNotes[foundWine.id] || ''}</textarea>
                `;
                container.appendChild(wDiv);
            }
        });
        
        attachWineListeners(container);
    }
    
    // Export Notes logic
    document.getElementById('export-notes').addEventListener('click', () => {
        let emailBody = "My Tasting Notes - Barolo & Friends Oslo\n\n";
        
        Object.keys(savedWines).forEach(id => {
            producers.forEach(p => {
                p.wines.forEach(w => {
                    if(w.id === id) {
                        emailBody += `PRODUCER: ${p.name}\n`;
                        emailBody += `WINE: ${w.name} (${w.vintage})\n`;
                        if(wineNotes[id]) {
                            emailBody += `NOTE: ${wineNotes[id]}\n`;
                        }
                        emailBody += `\n---------------------------\n\n`;
                    }
                });
            });
        });
        
        const mailto = `mailto:?subject=My Tasting Notes - Barolo & Friends&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailto;
    });
});


document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof eventData === 'undefined') {
            throw new Error("eventData is not defined. Check if data.js is loaded correctly.");
        }
        
        const producers = eventData.producers;
        
        // State
        let activeFilters = { text: '', barolo: false, bio: false, seeking: false };
        let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
        let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

        // Elements
        const grid = document.getElementById('producer-list');
        const searchInput = document.getElementById('search-input');
        const btnBarolo = document.getElementById('filter-barolo');
        const btnBio = document.getElementById('filter-bio');
        const btnSeeking = document.getElementById('filter-seeking');
        
        const navProducers = document.getElementById('nav-producers');
        const navMasterclasses = document.getElementById('nav-masterclasses');
        const navNotebook = document.getElementById('nav-notebook');
        
        const sectionProducers = document.getElementById('section-producers');
        const sectionMasterclasses = document.getElementById('section-masterclasses');
        const sectionNotebook = document.getElementById('section-notebook');
        
        const countProducers = document.getElementById('count-producers');
        const countNotebook = document.getElementById('count-notebook');
        
        const modalProducer = document.getElementById('modal-producer');
        const btnInfo = document.getElementById('btn-info');
        const modalInfo = document.getElementById('modal-info');
        
        // Setup Header
        document.getElementById('event-title').textContent = eventData.event.title;
        document.getElementById('event-date-city').textContent = eventData.event.subtitle;
        document.getElementById('welcome-message').textContent = eventData.event.welcomeMessage;
        document.getElementById('event-slogan').textContent = eventData.event.slogan;
        countProducers.textContent = eventData.producers.length;

        updateNotebookCount();
        renderProducers();
        renderMasterclasses();

        // Filters
        searchInput.addEventListener('input', (e) => { activeFilters.text = e.target.value.toLowerCase(); renderProducers(); });
        btnBarolo.addEventListener('click', () => { activeFilters.barolo = !activeFilters.barolo; btnBarolo.classList.toggle('active'); renderProducers(); });
        btnBio.addEventListener('click', () => { activeFilters.bio = !activeFilters.bio; btnBio.classList.toggle('active'); renderProducers(); });
        btnSeeking.addEventListener('click', () => { activeFilters.seeking = !activeFilters.seeking; btnSeeking.classList.toggle('active'); renderProducers(); });

        // Nav
        function switchTab(tab) {
            navProducers.classList.remove('active');
            navMasterclasses.classList.remove('active');
            navNotebook.classList.remove('active');
            sectionProducers.style.display = 'none';
            sectionMasterclasses.style.display = 'none';
            sectionNotebook.style.display = 'none';
            
            if(tab === 'producers') {
                navProducers.classList.add('active');
                sectionProducers.style.display = 'block';
                renderProducers();
            } else if(tab === 'masterclasses') {
                navMasterclasses.classList.add('active');
                sectionMasterclasses.style.display = 'block';
            } else if(tab === 'notebook') {
                navNotebook.classList.add('active');
                sectionNotebook.style.display = 'block';
                renderNotebook();
            }
        }
        
        navProducers.addEventListener('click', () => switchTab('producers'));
        navMasterclasses.addEventListener('click', () => switchTab('masterclasses'));
        navNotebook.addEventListener('click', () => switchTab('notebook'));
        btnInfo.addEventListener('click', () => modalInfo.showModal());

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById(e.target.dataset.close).close();
            });
        });

        function getEnotourismIcon(type) {
            const icons = {
                'accommodation': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>',
                'restaurant': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
                'pool': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 21H2v-2h20v2zm-2.03-3H4.03c1.37-1.16 2.37-2.7 2.76-4.4.15-.65.22-1.31.21-1.95 0-.08.01-.16.02-.23.1-1.63 1.45-2.92 3.1-2.92 1.66 0 3.01 1.31 3.1 2.94.01.07.02.14.02.22-.01.64.06 1.3.21 1.95.39 1.7 1.39 3.24 2.76 4.39zM8.13 10.37c-.77.16-1.39.73-1.64 1.48-.12.38-.17.77-.16 1.16-.01.76-.23 1.5-.64 2.13.98-1 1.62-2.3 1.79-3.7.13-.19.32-.34.54-.42.23-.08.47-.07.7-.01.02-.01.04-.02.05-.03-.21-.19-.44-.39-.64-.61zm7.74 0c-.21.22-.44.42-.64.61.02.01.03.02.05.03.22-.06.46-.07.7-.01.22.07.41.22.54.42.17 1.4.81 2.7 1.79 3.7-.41-.63-.63-1.37-.64-2.13.01-.39-.04-.78-.16-1.16-.25-.75-.87-1.32-1.64-1.48zM12 4.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/></svg>',
                'vineyard': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>'
            };
            return icons[type] || '';
        }

        function renderProducers() {
            grid.innerHTML = '';
            
            let filtered = producers.filter(p => {
                let matchText = true;
                if (activeFilters.text) {
                    const searchStr = `${p.name} ${p.region} ${p.wines.map(w=>w.name).join(' ')}`.toLowerCase();
                    matchText = searchStr.includes(activeFilters.text);
                }
                let matchSeeking = activeFilters.seeking ? (p.market === 'seeking') : true;
                let matchBarolo = activeFilters.barolo ? p.wines.some(w => w.name.toLowerCase().includes('barolo')) : true;
                let matchBio = activeFilters.bio ? p.wines.some(w => w.organic) : true;
                
                return matchText && matchSeeking && matchBarolo && matchBio;
            });

            if(filtered.length === 0) {
                grid.innerHTML = '<p class="empty-state">No producers found matching the filters.</p>';
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'producer-card';
                let marketBadge = p.market === 'seeking' 
                    ? `<span class="status-badge seeking"><span class="dot"></span>Seeking importer</span>` 
                    : `<span class="status-badge imported"><span class="dot"></span>Importer: ${p.importer}</span>`;
                card.innerHTML = `
                    <div class="card-top">
                        <span class="card-region">${p.region}, ${p.city}</span>
                        <span class="card-table">Table <strong>${p.desk}</strong></span>
                    </div>
                    <div class="card-title-wrap">
                        <img src="${p.logo}" class="card-logo" onerror="this.style.display='none'">
                        <h3 class="card-title">${p.name}</h3>
                    </div>
                    <div class="card-status">${marketBadge}</div>
                    <div class="card-bottom">
                        <span>${p.wines.length} wines</span>
                        <span class="view-link">View producer ↗</span>
                    </div>
                `;
                card.addEventListener('click', () => openProducerModal(p));
                grid.appendChild(card);
            });
        }

        function openProducerModal(p) {
            document.getElementById('mp-name').textContent = p.name;
            document.getElementById('mp-desk').innerHTML = `Table <strong>${p.desk}</strong>`;
            document.getElementById('mp-region').textContent = `${p.region} • ${p.city}`;
            document.getElementById('mp-contact').innerHTML = `<strong>${p.contactName}</strong>, ${p.contactRole}`;
            document.getElementById('mp-logo').src = p.logo;
            
            const emailBtn = document.getElementById('mp-email');
            emailBtn.href = `mailto:${p.email}`;
            
            let marketText = p.market === 'seeking' ? 'Seeking Importer' : `Imported by ${p.importer}`;
            document.getElementById('mp-market-status').textContent = marketText;

            const iconsContainer = document.getElementById('mp-icons');
            iconsContainer.innerHTML = '';
            if (p.icons && p.icons.length > 0) {
                p.icons.forEach(iconType => {
                    const div = document.createElement('div');
                    div.className = 'eno-icon';
                    div.innerHTML = getEnotourismIcon(iconType);
                    div.title = iconType.charAt(0).toUpperCase() + iconType.slice(1);
                    iconsContainer.appendChild(div);
                });
            }

            const winesContainer = document.getElementById('mp-wines');
            winesContainer.innerHTML = '';
            
            p.wines.forEach(w => {
                const wDiv = document.createElement('div');
                wDiv.className = 'wine-item';
                let organicHtml = w.organic ? `<svg class="grape-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18 10c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5c0 1.4-1.1 2.5-2.5 2.5-.2 0-.4 0-.6-.1C14.6 16.9 13.4 18 12 18s-2.6-1.1-2.9-2.6c-.2.1-.4.1-.6.1-1.4 0-2.5-1.1-2.5-2.5 0-.8.7-1.5 1.5-1.5C6.7 11.5 6 10.8 6 10c0-1.4 1.1-2.5 2.5-2.5.2 0 .4 0 .6.1C9.4 6.1 10.6 5 12 5s2.6 1.1 2.9 2.6c.2-.1.4-.1.6-.1 1.4 0 2.5 1.1 2.5 2.5M12 2C9.2 2 7 4.2 7 7c0 .6.1 1.1.3 1.6C5.5 9.1 4 10.8 4 13c0 1.9 1.3 3.5 3 3.9V20c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-3.1c1.7-.4 3-2 3-3.9 0-2.2-1.5-3.9-3.3-4.4C16.9 5.3 14.6 2 12 2z"/></svg>` : '';
                let isSaved = !!savedWines[w.id];
                
                wDiv.innerHTML = `
                    <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    <div class="wine-header">
                        <div>
                            <div class="wine-name">${w.name} ${organicHtml}</div>
                            <div class="wine-meta">${w.vintage} &bull; ${w.type}</div>
                        </div>
                    </div>
                    <textarea class="wine-note-input" data-wine-id="${w.id}" placeholder="Tasting notes...">${wineNotes[w.id] || ''}</textarea>
                `;
                winesContainer.appendChild(wDiv);
            });
            attachWineListeners(winesContainer);
            modalProducer.showModal();
        }

        function attachWineListeners(container) {
            container.querySelectorAll('.heart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const wineId = e.currentTarget.dataset.wineId;
                    if (savedWines[wineId]) {
                        delete savedWines[wineId];
                        e.currentTarget.classList.remove('active');
                    } else {
                        savedWines[wineId] = true;
                        e.currentTarget.classList.add('active');
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
                    
                    if(e.target.value.trim() !== '' && !savedWines[wineId]) {
                        savedWines[wineId] = true;
                        localStorage.setItem('bf_savedWines', JSON.stringify(savedWines));
                        updateNotebookCount();
                        const heartBtn = e.currentTarget.parentElement.querySelector('.heart-btn');
                        if(heartBtn) heartBtn.classList.add('active');
                    }
                });
            });
        }

        function updateNotebookCount() {
            const count = Object.keys(savedWines).length;
            countNotebook.textContent = count;
            if(count > 0) {
                countNotebook.style.background = 'var(--brand)';
                countNotebook.style.color = 'white';
            } else {
                countNotebook.style.background = '#e5e7eb';
                countNotebook.style.color = '#6b7280';
            }
        }

        function renderNotebook() {
            const container = document.getElementById('notebook-list');
            container.innerHTML = '';
            
            const savedIds = Object.keys(savedWines);
            if (savedIds.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted-light)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <h3>No wines saved yet.</h3>
                    <p>Explore the producers and tap the heart icon to save your favorites.</p>
                </div>`;
                return;
            }

            savedIds.forEach(id => {
                let foundWine = null; let foundProducer = null;
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = p; } }); });
                
                if (foundWine) {
                    const wDiv = document.createElement('div');
                    wDiv.className = 'wine-item';
                    let organicHtml = foundWine.organic ? `<svg class="grape-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18 10c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5c0 1.4-1.1 2.5-2.5 2.5-.2 0-.4 0-.6-.1C14.6 16.9 13.4 18 12 18s-2.6-1.1-2.9-2.6c-.2.1-.4.1-.6.1-1.4 0-2.5-1.1-2.5-2.5 0-.8.7-1.5 1.5-1.5C6.7 11.5 6 10.8 6 10c0-1.4 1.1-2.5 2.5-2.5.2 0 .4 0 .6.1C9.4 6.1 10.6 5 12 5s2.6 1.1 2.9 2.6c.2-.1.4-.1.6-.1 1.4 0 2.5 1.1 2.5 2.5M12 2C9.2 2 7 4.2 7 7c0 .6.1 1.1.3 1.6C5.5 9.1 4 10.8 4 13c0 1.9 1.3 3.5 3 3.9V20c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-3.1c1.7-.4 3-2 3-3.9 0-2.2-1.5-3.9-3.3-4.4C16.9 5.3 14.6 2 12 2z"/></svg>` : '';
                    wDiv.innerHTML = `
                        <button class="heart-btn active" data-wine-id="${foundWine.id}"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
                        <div class="wine-header">
                            <div>
                                <div class="wine-meta" style="color:var(--brand); font-weight:600; margin-bottom:4px; font-size: 11px;">${foundProducer.name}</div>
                                <div class="wine-name">${foundWine.name} ${organicHtml}</div>
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
        
        function renderMasterclasses() {
            const mcContainer = document.getElementById('masterclass-list');
            mcContainer.innerHTML = '';
            eventData.masterclasses.forEach(mc => {
                let winesHtml = mc.wines.map(w => `<div class="mc-wine-row"><strong>${w.producer}</strong> <span>${w.name} ${w.vintage}</span></div>`).join('');
                mcContainer.innerHTML += `
                    <div class="mc-card">
                        <div class="mc-time">${mc.time}</div>
                        <div class="mc-details">
                            <h3 class="mc-title">${mc.title}</h3>
                            <p class="mc-speaker">Led by ${mc.speaker}</p>
                            <details class="mc-wines-toggle">
                                <summary>${mc.wines.length} wines &bull; View list</summary>
                                <div class="mc-wines-content">${winesHtml}</div>
                            </details>
                        </div>
                    </div>
                `;
            });
        }
        
        document.getElementById('export-notes').addEventListener('click', () => {
            let emailBody = "My Tasting Notes - Barolo & Friends\n\n";
            Object.keys(savedWines).forEach(id => {
                producers.forEach(p => {
                    p.wines.forEach(w => {
                        if(w.id === id) {
                            emailBody += `PRODUCER: ${p.name}\n`;
                            emailBody += `WINE: ${w.name} (${w.vintage})\n`;
                            if(wineNotes[id]) emailBody += `NOTE: ${wineNotes[id]}\n`;
                            emailBody += `\n---------------------------\n\n`;
                        }
                    });
                });
            });
            window.location.href = `mailto:?subject=My Tasting Notes - Barolo & Friends&body=${encodeURIComponent(emailBody)}`;
        });
        
    } catch (error) {
        console.error("Critical error in app.js:", error);
        const errorLog = document.getElementById('error-log');
        if(errorLog) {
            errorLog.style.display = 'block';
            errorLog.innerHTML = `<strong>App Failed to Load</strong><br>${error.message}`;
        }
    }
});

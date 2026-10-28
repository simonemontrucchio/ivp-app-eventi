
document.addEventListener('DOMContentLoaded', () => {
    try {
        const producers = eventData.producers;
        
        let activeFilters = { text: '', barolo: false, bio: false, seeking: false };
        let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
        let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

        const grid = document.getElementById('producer-list');
        const searchInput = document.getElementById('search-input');
        const btnBarolo = document.getElementById('filter-barolo');
        const btnBio = document.getElementById('filter-bio');
        const btnSeeking = document.getElementById('filter-seeking');
        
        const overlayProducer = document.getElementById('overlay-producer');
        const overlayInfo = document.getElementById('overlay-info');
        
        // PWA Install Logic
        let deferredPrompt;
        const pwaBanner = document.getElementById('pwa-banner');
        const pwaInstallBtn = document.getElementById('pwa-install-btn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            pwaBanner.style.display = 'flex';
        });
        
        pwaInstallBtn.addEventListener('click', async () => {
            pwaBanner.style.display = 'none';
            if(deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
        });

        // Setup Header Data
        document.getElementById('event-title').textContent = eventData.event.title;
        document.getElementById('event-date-city').textContent = eventData.event.subtitle;
        document.getElementById('welcome-message').textContent = eventData.event.welcomeMessage;
        document.getElementById('event-slogan').textContent = eventData.event.slogan;
        document.getElementById('app-hero').style.backgroundImage = `url(${eventData.event.coverImage})`;
        
        updateNotebookCount();
        renderProducers();
        renderMasterclasses();

        // Filters
        searchInput.addEventListener('input', (e) => { activeFilters.text = e.target.value.toLowerCase(); renderProducers(); });
        btnBarolo.addEventListener('click', () => { activeFilters.barolo = !activeFilters.barolo; btnBarolo.classList.toggle('active'); renderProducers(); });
        btnBio.addEventListener('click', () => { activeFilters.bio = !activeFilters.bio; btnBio.classList.toggle('active'); renderProducers(); });
        btnSeeking.addEventListener('click', () => { activeFilters.seeking = !activeFilters.seeking; btnSeeking.classList.toggle('active'); renderProducers(); });

        // Bottom Navigation Logic
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.page-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                
                // Update active state on buttons
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update active state on sections
                sections.forEach(sec => {
                    sec.style.display = 'none';
                    sec.classList.remove('active');
                });
                const targetSection = document.getElementById(targetId);
                targetSection.style.display = 'block';
                // slight delay for animation
                setTimeout(() => targetSection.classList.add('active'), 10);
                
                window.scrollTo(0, 0);
                
                if(targetId === 'section-producers') renderProducers();
                if(targetId === 'section-masterclasses') renderMasterclasses();
                if(targetId === 'section-notebook') renderNotebook();
            });
        });
        
        document.getElementById('btn-info').addEventListener('click', () => {
            overlayInfo.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        // Close Modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const overlayId = e.currentTarget.dataset.close;
                document.getElementById(overlayId).classList.remove('show');
                document.body.style.overflow = '';
            });
        });
        
        // Close on backdrop click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if(e.target === overlay) {
                    overlay.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });

        function getEnotourismIcon(type) {
            const icons = {
                'accommodation': '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>',
                'restaurant': '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
                'pool': '<svg viewBox="0 0 24 24"><path d="M22 21H2v-2h20v2zm-2.03-3H4.03c1.37-1.16 2.37-2.7 2.76-4.4.15-.65.22-1.31.21-1.95 0-.08.01-.16.02-.23.1-1.63 1.45-2.92 3.1-2.92 1.66 0 3.01 1.31 3.1 2.94.01.07.02.14.02.22-.01.64.06 1.3.21 1.95.39 1.7 1.39 3.24 2.76 4.39zM8.13 10.37c-.77.16-1.39.73-1.64 1.48-.12.38-.17.77-.16 1.16-.01.76-.23 1.5-.64 2.13.98-1 1.62-2.3 1.79-3.7.13-.19.32-.34.54-.42.23-.08.47-.07.7-.01.02-.01.04-.02.05-.03-.21-.19-.44-.39-.64-.61zm7.74 0c-.21.22-.44.42-.64.61.02.01.03.02.05.03.22-.06.46-.07.7-.01.22.07.41.22.54.42.17 1.4.81 2.7 1.79 3.7-.41-.63-.63-1.37-.64-2.13.01-.39-.04-.78-.16-1.16-.25-.75-.87-1.32-1.64-1.48zM12 4.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/></svg>',
                'vineyard': '<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>'
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
                grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg viewBox="0 0 24 24"><use href="#icon-search"></use></svg>
                    <h3>No producers found.</h3>
                    <p>Try adjusting your filters.</p>
                </div>`;
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
                        <img src="${p.logo}" class="card-logo" onerror="this.src='assets/logo_placeholder.png'">
                        <h3 class="card-title">${p.name}</h3>
                    </div>
                    <div class="card-status">${marketBadge}</div>
                    <div class="card-bottom">
                        <span>${p.wines.length} wines</span>
                        <span class="view-link">View producer &rarr;</span>
                    </div>
                `;
                card.addEventListener('click', () => openProducerModal(p));
                grid.appendChild(card);
            });
        }

        function openProducerModal(p) {
            document.getElementById('mp-name').textContent = p.name;
            document.getElementById('mp-desk').textContent = p.desk;
            document.getElementById('mp-region').textContent = `${p.region} • ${p.city}`;
            document.getElementById('mp-contact').textContent = `${p.contactName}, ${p.contactRole}`;
            
            const logoEl = document.getElementById('mp-logo');
            logoEl.src = p.logo;
            logoEl.onerror = () => logoEl.src = 'assets/logo_placeholder.png';
            
            const emailBtn = document.getElementById('mp-email');
            emailBtn.href = `mailto:${p.email}`;
            
            let marketText = p.market === 'seeking' ? 'Seeking Importer' : `Imported by ${p.importer}`;
            const badgeEl = document.getElementById('mp-status-badge');
            badgeEl.className = `status-badge ${p.market === 'seeking' ? 'seeking' : 'imported'}`;
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
                let organicHtml = w.organic ? `<svg class="grape-icon"><use href="#icon-leaf"></use></svg>` : '';
                let isSaved = !!savedWines[w.id];
                
                wDiv.innerHTML = `
                    <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                        <svg><use href="#icon-heart"></use></svg>
                    </button>
                    <div class="wine-header">
                        <div class="wine-name">${w.name} ${organicHtml}</div>
                        <div class="wine-meta">${w.vintage} &bull; ${w.type}</div>
                    </div>
                    <textarea class="wine-note-input" data-wine-id="${w.id}" placeholder="Tasting notes...">${wineNotes[w.id] || ''}</textarea>
                `;
                winesContainer.appendChild(wDiv);
            });
            attachWineListeners(winesContainer);
            
            overlayProducer.classList.add('show');
            document.body.style.overflow = 'hidden'; 
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
            document.getElementById('count-notebook').textContent = count;
        }

        function renderNotebook() {
            const container = document.getElementById('notebook-list');
            container.innerHTML = '';
            
            const savedIds = Object.keys(savedWines);
            if (savedIds.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                    <svg><use href="#icon-heart"></use></svg>
                    <h3>No wines saved yet.</h3>
                    <p>Explore the producers and tap the heart icon to save your favorites.</p>
                </div>`;
                return;
            }

            savedIds.forEach(id => {
                let foundWine = null; let foundProducer = null;
                // Check normal producers
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {name: p.name}; } }); });
                // Check masterclasses
                if(!foundWine) {
                    eventData.masterclasses.forEach(mc => { mc.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {name: w.producer + ' (Masterclass)'}; } }); });
                }
                
                if (foundWine) {
                    const wDiv = document.createElement('div');
                    wDiv.className = 'wine-item';
                    let organicHtml = foundWine.organic ? `<svg class="grape-icon"><use href="#icon-leaf"></use></svg>` : '';
                    
                    wDiv.innerHTML = `
                        <button class="heart-btn active" data-wine-id="${foundWine.id}">
                            <svg><use href="#icon-heart"></use></svg>
                        </button>
                        <div class="wine-header">
                            <div class="wine-meta" style="color:var(--brand); font-weight:700; margin-bottom:8px; font-size: 11px; text-transform:uppercase; letter-spacing:1px;">${foundProducer.name}</div>
                            <div class="wine-name">${foundWine.name} ${organicHtml}</div>
                            <div class="wine-meta">${foundWine.vintage || ''} ${foundWine.type ? '• '+foundWine.type : ''}</div>
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
                let winesHtml = mc.wines.map(w => {
                    let isSaved = !!savedWines[w.id];
                    return `
                    <div class="mc-wine-row">
                        <div class="mc-wine-info">
                            <strong>${w.producer}</strong>
                            <span>${w.name} ${w.vintage}</span>
                        </div>
                        <button class="mc-heart heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                            <svg><use href="#icon-heart"></use></svg>
                        </button>
                    </div>`
                }).join('');
                
                mcContainer.innerHTML += `
                    <div class="mc-card">
                        <div class="mc-header">
                            <div class="mc-time">${mc.time}</div>
                            <h3 class="mc-title">${mc.title}</h3>
                            <p class="mc-speaker">Led by ${mc.speaker}</p>
                        </div>
                        <div class="mc-wines">
                            ${winesHtml}
                        </div>
                    </div>
                `;
            });
            attachWineListeners(mcContainer);
        }
        
        document.getElementById('export-notes').addEventListener('click', () => {
            let emailBody = "My Tasting Notes - Barolo & Friends\n\n";
            Object.keys(savedWines).forEach(id => {
                let foundWine = null; let foundProducer = null;
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {name: p.name}; } }); });
                if(!foundWine) { eventData.masterclasses.forEach(mc => { mc.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {name: w.producer}; } }); }); }
                
                if(foundWine) {
                    emailBody += `PRODUCER: ${foundProducer.name}\n`;
                    emailBody += `WINE: ${foundWine.name} (${foundWine.vintage})\n`;
                    if(wineNotes[id]) emailBody += `NOTE: ${wineNotes[id]}\n`;
                    emailBody += `\n---------------------------\n\n`;
                }
            });
            window.location.href = `mailto:?subject=My Tasting Notes - Barolo & Friends&body=${encodeURIComponent(emailBody)}`;
        });
        
    } catch (error) {
        console.error("Critical error in app.js:", error);
    }
});

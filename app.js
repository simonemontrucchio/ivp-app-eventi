
document.addEventListener('DOMContentLoaded', () => {
    try {
        const producers = eventData.producers;
        let activeFilters = { text: '', barolo: false, bio: false, seeking: false };
        let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
        let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

        const grid = document.getElementById('producer-list');
        const overlayProducer = document.getElementById('overlay-producer');
        
        // Navigation Logic
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.page-section');
        
        function switchTab(targetId) {
            navItems.forEach(nav => {
                nav.classList.remove('active');
                if(nav.getAttribute('data-target') === targetId) nav.classList.add('active');
            });
            sections.forEach(sec => sec.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            targetSection.style.display = 'block';
            setTimeout(() => targetSection.classList.add('active'), 10);
            window.scrollTo(0, 0);
            
            if(targetId === 'section-producers') renderProducers();
            if(targetId === 'section-masterclasses') renderMasterclasses();
            if(targetId === 'section-notebook') renderNotebook();
        }
        
        navItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.getAttribute('data-target')));
        });

        // Modals
        document.getElementById('btn-info').addEventListener('click', () => {
            document.getElementById('overlay-info').classList.add('show');
        });
        document.getElementById('btn-open-map').addEventListener('click', () => {
            document.getElementById('overlay-info').classList.remove('show');
            document.getElementById('overlay-map').classList.add('show');
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById(e.currentTarget.dataset.close).classList.remove('show');
            });
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if(e.target === overlay) overlay.classList.remove('show');
            });
        });

        // Initialize Data
        document.getElementById('search-input').addEventListener('input', (e) => { activeFilters.text = e.target.value.toLowerCase(); renderProducers(); });
        ['barolo', 'bio', 'seeking'].forEach(f => {
            document.getElementById(`filter-${f}`).addEventListener('click', (e) => {
                activeFilters[f] = !activeFilters[f];
                e.currentTarget.classList.toggle('active');
                renderProducers();
            });
        });

        function getEnotourismIcon(type) {
            const map = {
                'accommodation': '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>',
                'restaurant': '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
                'vineyard': '<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>'
            };
            return map[type] || '';
        }

        // Global function to open producer by ID (allows deep linking from Notebook/Masterclass)
        window.openProducerById = function(id) {
            const p = producers.find(x => x.id === id);
            if(p) openProducerModal(p);
        };

        function renderProducers() {
            grid.innerHTML = '';
            let filtered = producers.filter(p => {
                let matchText = true;
                if (activeFilters.text) matchText = `${p.name} ${p.region} ${p.wines.map(w=>w.name).join(' ')}`.toLowerCase().includes(activeFilters.text);
                let matchSeeking = activeFilters.seeking ? (p.market === 'seeking') : true;
                let matchBarolo = activeFilters.barolo ? p.wines.some(w => w.name.toLowerCase().includes('barolo')) : true;
                let matchBio = activeFilters.bio ? p.wines.some(w => w.organic) : true;
                return matchText && matchSeeking && matchBarolo && matchBio;
            });

            if(filtered.length === 0) {
                grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center; color:#999;">No producers found.</div>`;
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
                    <h3 class="card-title">${p.name}</h3>
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
            document.getElementById('mp-contact').textContent = `${p.contactName}`;
            
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
                    const div = document.createElement('div'); div.className = 'eno-icon';
                    div.innerHTML = getEnotourismIcon(iconType); iconsContainer.appendChild(div);
                });
            }

            const winesContainer = document.getElementById('mp-wines');
            winesContainer.innerHTML = '';
            
            p.wines.forEach(w => {
                const wDiv = document.createElement('div'); wDiv.className = 'wine-item';
                let organicHtml = w.organic ? `<svg class="grape-icon"><use href="#icon-leaf"></use></svg>` : '';
                let isSaved = !!savedWines[w.id];
                
                wDiv.innerHTML = `
                    <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                        <svg><use href="${isSaved ? '#icon-heart-filled' : '#icon-heart'}"></use></svg>
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
        }

        function attachWineListeners(container) {
            container.querySelectorAll('.heart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const wineId = e.currentTarget.dataset.wineId;
                    if (savedWines[wineId]) {
                        delete savedWines[wineId];
                        e.currentTarget.classList.remove('active');
                        e.currentTarget.innerHTML = '<svg><use href="#icon-heart"></use></svg>';
                    } else {
                        savedWines[wineId] = true;
                        e.currentTarget.classList.add('active');
                        e.currentTarget.innerHTML = '<svg><use href="#icon-heart-filled"></use></svg>';
                    }
                    localStorage.setItem('bf_savedWines', JSON.stringify(savedWines));
                    updateNotebookCount();
                });
            });

            container.querySelectorAll('.wine-note-input').forEach(input => {
                input.addEventListener('click', (e) => e.stopPropagation());
                input.addEventListener('input', (e) => {
                    const wineId = e.currentTarget.dataset.wineId;
                    wineNotes[wineId] = e.target.value;
                    localStorage.setItem('bf_wineNotes', JSON.stringify(wineNotes));
                    if(e.target.value.trim() !== '' && !savedWines[wineId]) {
                        savedWines[wineId] = true;
                        localStorage.setItem('bf_savedWines', JSON.stringify(savedWines));
                        updateNotebookCount();
                        const heartBtn = e.currentTarget.parentElement.querySelector('.heart-btn');
                        if(heartBtn) {
                            heartBtn.classList.add('active');
                            heartBtn.innerHTML = '<svg><use href="#icon-heart-filled"></use></svg>';
                        }
                    }
                });
            });
        }

        function updateNotebookCount() {
            const count = Object.keys(savedWines).length;
            const badge = document.getElementById('count-notebook');
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }

        function renderNotebook() {
            const container = document.getElementById('notebook-list');
            container.innerHTML = '';
            const savedIds = Object.keys(savedWines);
            if (savedIds.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:40px; color:#999;">No wines saved yet.</div>`;
                return;
            }

            savedIds.forEach(id => {
                let foundWine = null; let foundProducer = null;
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = p; } }); });
                if(!foundWine) {
                    eventData.masterclasses.forEach(mc => { mc.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {id: w.producerId, name: w.producerName + ' (MC)'}; } }); });
                }
                
                if (foundWine) {
                    const wDiv = document.createElement('div'); wDiv.className = 'wine-item';
                    let organicHtml = foundWine.organic ? `<svg class="grape-icon"><use href="#icon-leaf"></use></svg>` : '';
                    wDiv.innerHTML = `
                        <button class="heart-btn active" data-wine-id="${foundWine.id}">
                            <svg><use href="#icon-heart-filled"></use></svg>
                        </button>
                        <div class="wine-header" onclick="window.openProducerById('${foundProducer.id}')">
                            <div class="wine-meta" style="color:var(--brand); font-weight:700; margin-bottom:6px; font-size:11px; text-transform:uppercase;">${foundProducer.name}</div>
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
                    <div class="mc-wine-row" onclick="window.openProducerById('${w.producerId}')">
                        <div class="mc-wine-info">
                            <strong>${w.producerName}</strong>
                            <span>${w.name} ${w.vintage}</span>
                        </div>
                        <button class="heart-btn ${isSaved ? 'active' : ''}" style="position:static;" data-wine-id="${w.id}">
                            <svg><use href="${isSaved ? '#icon-heart-filled' : '#icon-heart'}"></use></svg>
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
                        <div class="mc-wines">${winesHtml}</div>
                    </div>
                `;
            });
            attachWineListeners(mcContainer);
        }
        
        // iCal Generation
        document.getElementById('btn-calendar').addEventListener('click', () => {
            const icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Barolo & Friends Oslo\nDTSTART:20260831T130000Z\nDTEND:20260831T200000Z\nLOCATION:Gamle Logen, Oslo\nEND:VEVENT\nEND:VCALENDAR";
            const blob = new Blob([icsData], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'barolo_friends.ics'; a.click();
        });

        // Email Export
        document.getElementById('export-notes').addEventListener('click', () => {
            let emailBody = "My Tasting Notes - Barolo & Friends\n\n";
            Object.keys(savedWines).forEach(id => {
                let foundWine = null; let foundProducer = null;
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = p; } }); });
                if(!foundWine) { eventData.masterclasses.forEach(mc => { mc.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {name: w.producerName}; } }); }); }
                if(foundWine) {
                    emailBody += `PRODUCER: ${foundProducer.name}\n`;
                    emailBody += `WINE: ${foundWine.name} (${foundWine.vintage})\n`;
                    if(wineNotes[id]) emailBody += `NOTE: ${wineNotes[id]}\n`;
                    emailBody += `\n---------------------------\n\n`;
                }
            });
            window.location.href = `mailto:?subject=My Tasting Notes - Barolo & Friends&body=${encodeURIComponent(emailBody)}`;
        });
        
        updateNotebookCount();
        renderProducers();
    } catch (error) {
        console.error("Critical error in app.js:", error);
    }
});

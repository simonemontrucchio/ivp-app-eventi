
document.addEventListener('DOMContentLoaded', () => {
    try {
        const producers = eventData.producers;
        let activeFilters = { text: '', barolo: false, bio: false, seeking: false };
        let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
        let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

        const grid = document.getElementById('producer-list');
        const overlayProducer = document.getElementById('overlay-producer');
        
        // Navigation
        const navItemsMobile = document.querySelectorAll('.bottom-nav .nav-item');
        const navItemsDesktop = document.querySelectorAll('.top-nav-links .nav-item-desktop');
        const sections = document.querySelectorAll('.page-section');
        
        function switchTab(targetId) {
            navItemsMobile.forEach(nav => {
                nav.classList.remove('active');
                if(nav.getAttribute('data-target') === targetId) nav.classList.add('active');
            });
            navItemsDesktop.forEach(nav => {
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
        
        navItemsMobile.forEach(item => item.addEventListener('click', () => switchTab(item.getAttribute('data-target'))));
        navItemsDesktop.forEach(item => item.addEventListener('click', () => switchTab(item.getAttribute('data-target'))));

        // Modals
        document.getElementById('btn-info').addEventListener('click', () => document.getElementById('overlay-info').classList.add('show'));
        document.getElementById('btn-info-desktop').addEventListener('click', () => document.getElementById('overlay-info').classList.add('show'));
        document.getElementById('btn-open-map').addEventListener('click', () => {
            document.getElementById('overlay-info').classList.remove('show');
            document.getElementById('overlay-map').classList.add('show');
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => document.getElementById(e.currentTarget.dataset.close).classList.remove('show'));
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
                let matchBio = activeFilters.bio ? p.certifications.includes('Organic winery') || p.certifications.includes('Green Experience') : true;
                return matchText && matchSeeking && matchBarolo && matchBio;
            });

            if(filtered.length === 0) {
                grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center; color:#999;">No producers found matching criteria.</div>`;
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'producer-card';
                let marketBadge = p.market === 'seeking' 
                    ? `<span class="status-badge seeking"><span class="dot"></span>Searching for importer</span>` 
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
            document.getElementById('mp-contact').textContent = `${p.contactName}, ${p.contactRole}`;
            
            // Production data
            const prodEl = document.getElementById('mp-production');
            if (p.production) {
                prodEl.textContent = `Production: ${p.production} bottles`;
                prodEl.style.display = 'block';
            } else {
                prodEl.style.display = 'none';
            }
            
            const emailBtn = document.getElementById('mp-email');
            if(p.email) {
                emailBtn.href = `mailto:${p.email}`;
                emailBtn.style.display = 'flex';
            } else {
                emailBtn.style.display = 'none';
            }
            
            let marketText = p.market === 'seeking' ? 'Searching for importer' : `Imported by: ${p.importer}`;
            const badgeEl = document.getElementById('mp-status-badge');
            badgeEl.className = `status-badge ${p.market === 'seeking' ? 'seeking' : 'imported'}`;
            document.getElementById('mp-market-status').textContent = marketText;

            // Certifications
            const iconsContainer = document.getElementById('mp-icons');
            iconsContainer.innerHTML = '';
            if (p.certifications && p.certifications.length > 0) {
                p.certifications.forEach(cert => {
                    const div = document.createElement('div'); div.className = 'eno-badge';
                    div.textContent = cert;
                    iconsContainer.appendChild(div);
                });
            }

            const winesContainer = document.getElementById('mp-wines');
            winesContainer.innerHTML = '';
            
            p.wines.forEach(w => {
                const wDiv = document.createElement('div'); wDiv.className = 'wine-item';
                let isSaved = !!savedWines[w.id];
                
                wDiv.innerHTML = `
                    <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                        <svg><use href="${isSaved ? '#icon-heart-filled' : '#icon-heart'}"></use></svg>
                    </button>
                    <div class="wine-header">
                        <div class="wine-name">${w.name}</div>
                        <div class="wine-meta">${w.vintage !== 'NV' ? w.vintage : 'NV'} &bull; ${w.type}</div>
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
            const badgeM = document.getElementById('count-notebook');
            const badgeD = document.getElementById('count-notebook-desktop');
            badgeM.textContent = count; badgeD.textContent = count;
            badgeM.style.display = count > 0 ? 'block' : 'none';
            badgeD.style.display = count > 0 ? 'inline-block' : 'none';
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
                
                if (foundWine) {
                    const wDiv = document.createElement('div'); wDiv.className = 'wine-item';
                    wDiv.innerHTML = `
                        <button class="heart-btn active" data-wine-id="${foundWine.id}">
                            <svg><use href="#icon-heart-filled"></use></svg>
                        </button>
                        <div class="wine-header" onclick="window.openProducerById('${foundProducer.id}')">
                            <div class="wine-meta" style="color:var(--brand); font-weight:700; margin-bottom:6px; font-size:11px; text-transform:uppercase;">${foundProducer.name}</div>
                            <div class="wine-name">${foundWine.name}</div>
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
                if(foundWine) {
                    emailBody += `PRODUCER: ${foundProducer.name}\n`;
                    emailBody += `WINE: ${foundWine.name} (${foundWine.vintage})\n`;
                    if(wineNotes[id]) emailBody += `NOTE: ${wineNotes[id]}\n`;
                    emailBody += `\n---------------------------\n\n`;
                }
            });
            window.location.href = `mailto:?subject=My Tasting Notes - Barolo & Friends&body=${encodeURIComponent(emailBody)}`;
        });
        
        // PWA logic
        let deferredPrompt;
        const pwaBanner = document.getElementById('pwa-banner');
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); deferredPrompt = e; pwaBanner.style.display = 'flex';
        });
        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            pwaBanner.style.display = 'none';
            if(deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
        });

        document.getElementById('app-hero').style.backgroundImage = `url(${eventData.event.coverImage})`;
        document.getElementById('event-title').textContent = eventData.event.title;
        document.getElementById('event-date-city').textContent = eventData.event.subtitle;
        
        updateNotebookCount();
        renderProducers();
    } catch (error) {
        console.error("Error in app.js:", error);
    }
});

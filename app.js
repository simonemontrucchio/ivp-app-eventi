document.addEventListener('DOMContentLoaded', () => {
    try {
        const producers = eventData.producers;
        let activeFilters = { text: '', barolo: false, bio: false, seeking: false };
        let activeSort = 'table';
        let savedWines = JSON.parse(localStorage.getItem('bf_savedWines')) || {};
        let wineNotes = JSON.parse(localStorage.getItem('bf_wineNotes')) || {};

        const grid = document.getElementById('producer-list');
        
        // Algoritmo di tolleranza errori (Levenshtein Distance)
        function getTypoDistance(a, b) {
            if(a.length === 0) return b.length;
            if(b.length === 0) return a.length;
            let matrix = [];
            for(let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
            for(let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
            for(let i = 1; i <= b.length; i++) {
                for(let j = 1; j <= a.length; j++) {
                    if(b.charAt(i-1) === a.charAt(j-1)) {
                        matrix[i][j] = matrix[i-1][j-1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                    }
                }
            }
            return matrix[b.length][a.length];
        }
        
        // Navigation 
        const navItemsMobile = document.querySelectorAll('.bottom-nav .nav-item');
        const navItemsDesktop = document.querySelectorAll('.top-nav-links .nav-item-desktop');
        const sections = document.querySelectorAll('.page-section');
        
        function switchTab(targetId) {
            navItemsMobile.forEach(nav => {
                nav.classList.toggle('active', nav.getAttribute('data-target') === targetId);
            });
            navItemsDesktop.forEach(nav => {
                nav.classList.toggle('active', nav.getAttribute('data-target') === targetId);
            });
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            window.scrollTo(0, 0);
            
            if(targetId === 'section-notebook') renderNotebook(); 
            if(targetId === 'section-masterclasses') renderMasterclasses();
        }
        
        navItemsMobile.forEach(item => item.addEventListener('click', () => switchTab(item.getAttribute('data-target'))));
        navItemsDesktop.forEach(item => item.addEventListener('click', () => switchTab(item.getAttribute('data-target'))));

        // HISTORY API - Modalità Mobile Back Button
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('show');
            history.pushState({ modalOpen: true }, '');
        }

        function closeAllModals() {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
        }

        window.addEventListener('popstate', (e) => {
            closeAllModals();
        });

        // UI buttons to open Modals
        const btnInfoMobile = document.getElementById('btn-info-mobile');
        const btnInfoDesktop = document.getElementById('btn-info-desktop');
        if(btnInfoMobile) btnInfoMobile.addEventListener('click', () => openModal('overlay-info'));
        if(btnInfoDesktop) btnInfoDesktop.addEventListener('click', () => openModal('overlay-info'));
        
        document.getElementById('btn-open-map').addEventListener('click', () => {
            document.getElementById('overlay-info').classList.remove('show');
            document.getElementById('overlay-map').classList.add('show');
            history.replaceState({ modalOpen: true }, '');
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (history.state && history.state.modalOpen) { history.back(); } 
                else { closeAllModals(); }
            });
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if(e.target === overlay) {
                    if (history.state && history.state.modalOpen) { history.back(); } 
                    else { closeAllModals(); }
                }
            });
        });

        // Search & Filters
        document.getElementById('search-input').addEventListener('input', (e) => { 
            activeFilters.text = e.target.value.toLowerCase().trim(); 
            renderProducers(); 
        });
        ['barolo', 'bio', 'seeking'].forEach(f => {
            document.getElementById(`filter-${f}`).addEventListener('click', (e) => {
                activeFilters[f] = !activeFilters[f];
                e.currentTarget.classList.toggle('active');
                renderProducers();
            });
        });
        document.getElementById('sort-select').addEventListener('change', (e) => {
            activeSort = e.target.value;
            renderProducers();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            activeFilters = { text: '', barolo: false, bio: false, seeking: false };
            activeSort = 'table';
            document.getElementById('search-input').value = '';
            document.getElementById('sort-select').value = 'table';
            ['barolo', 'bio', 'seeking'].forEach(f => document.getElementById(`filter-${f}`).classList.remove('active'));
            renderProducers();
        });
        
        // Back to top
        const backToTopBtn = document.getElementById('back-to-top');
        window.addEventListener('scroll', () => {
            if(window.scrollY > 400) backToTopBtn.classList.remove('is-hidden');
            else backToTopBtn.classList.add('is-hidden');
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });

        window.openProducerById = function(id) {
            const p = producers.find(x => x.id === id);
            if(p) {
                document.getElementById('mp-name').textContent = p.name;
                document.getElementById('mp-desk').textContent = p.desk;
                document.getElementById('mp-region').textContent = `${p.region} • ${p.city}`;
                document.getElementById('mp-contact-name').textContent = p.contactName;
                document.getElementById('mp-contact-role').textContent = p.contactRole;
                
                const prodEl = document.getElementById('mp-production');
                if (p.production) {
                    prodEl.textContent = `Production: ${p.production} bottles`;
                    prodEl.style.display = 'block';
                } else {
                    prodEl.style.display = 'none';
                }
                
                const emailBtn = document.getElementById('mp-email');
                const websiteEl = document.getElementById('mp-website');
                if(p.email) {
                    emailBtn.href = `mailto:${p.email}`;
                    emailBtn.style.display = 'inline-flex';
                } else { emailBtn.style.display = 'none'; }
                
                if(p.website) {
                    websiteEl.href = `https://${p.website}`;
                    websiteEl.textContent = p.website;
                    websiteEl.style.display = 'block';
                } else { websiteEl.style.display = 'none'; }
                
                let marketText = p.market === 'seeking' ? 'Searching for importer' : `Imported by: ${p.importer}`;
                const badgeEl = document.getElementById('mp-status-badge');
                badgeEl.className = `status-badge ${p.market === 'seeking' ? 'seeking' : 'imported'}`;
                document.getElementById('mp-market-status').textContent = marketText;

                const badgesContainer = document.getElementById('mp-badges');
                const iconsContainer = document.getElementById('mp-icons-right');
                
                badgesContainer.innerHTML = (p.certifications || []).map(c => `<div class="eno-badge">${c}</div>`).join('');
                
                const iconMap = {
                    'accommodation': '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>',
                    'restaurant': '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
                    'vineyard': '<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>',
                    'pool': '<svg viewBox="0 0 24 24"><path d="M22 21H2v-2h20v2zm-2.03-3H4.03c1.37-1.16 2.37-2.7 2.76-4.4.15-.65.22-1.31.21-1.95 0-.08.01-.16.02-.23.1-1.63 1.45-2.92 3.1-2.92 1.66 0 3.01 1.31 3.1 2.94.01.07.02.14.02.22-.01.64.06 1.3.21 1.95.39 1.7 1.39 3.24 2.76 4.39zM8.13 10.37c-.77.16-1.39.73-1.64 1.48-.12.38-.17.77-.16 1.16-.01.76-.23 1.5-.64 2.13.98-1 1.62-2.3 1.79-3.7.13-.19.32-.34.54-.42.23-.08.47-.07.7-.01.02-.01.04-.02.05-.03-.21-.19-.44-.39-.64-.61zm7.74 0c-.21.22-.44.42-.64.61.02.01.03.02.05.03.22-.06.46-.07.7-.01.22.07.41.22.54.42.17 1.4.81 2.7 1.79 3.7-.41-.63-.63-1.37-.64-2.13.01-.39-.04-.78-.16-1.16-.25-.75-.87-1.32-1.64-1.48zM12 4.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/></svg>'
                };
                iconsContainer.innerHTML = (p.icons || []).map(icon => `<div class="eno-icon" title="${icon}">${iconMap[icon] || ''}</div>`).join('');

                const winesContainer = document.getElementById('mp-wines');
                winesContainer.innerHTML = p.wines.map(w => {
                    let isSaved = !!savedWines[w.id];
                    let organicHtml = w.organic ? `<svg class="grape-icon inline"><use href="#icon-grape"></use></svg>` : '';
                    let vintageText = w.vintage !== 'NV' ? ` ${w.vintage}` : '';
                    
                    return `
                    <div class="wine-item">
                        <button class="heart-btn ${isSaved ? 'active' : ''}" data-wine-id="${w.id}">
                            <svg><use href="${isSaved ? '#icon-heart-filled' : '#icon-heart'}"></use></svg>
                        </button>
                        <div class="wine-header">
                            <div class="wine-name">
                                ${w.name}${vintageText} 
                                ${organicHtml}
                            </div>
                            <div class="wine-meta"><span class="wine-type-badge ${w.color || 'red'}"></span> ${w.type}</div>
                        </div>
                        <textarea class="wine-note-input" data-wine-id="${w.id}" placeholder="Tasting notes...">${wineNotes[w.id] || ''}</textarea>
                    </div>`;
                }).join('');
                
                attachWineListeners(winesContainer);
                openModal('overlay-producer');
            }
        };

        function renderProducers() {
            let filtered = producers.filter(p => {
                let matchText = true;
                if (activeFilters.text) {
                    const searchStr = `${p.name} ${p.region} ${p.city} Table ${p.desk} ${p.wines.map(w=>w.name + " " + w.vintage + " " + w.type).join(' ')}`.toLowerCase();
                    const queryWords = activeFilters.text.split(/\s+/);
                    const targetWords = searchStr.split(/\s+/);
                    
                    // Controlla che ogni parola cercata sia presente o abbia al massimo 1/2 errori di battitura
                    matchText = queryWords.every(qw => {
                        return targetWords.some(tw => {
                            if (tw.includes(qw)) return true;
                            if (qw.length > 3 && Math.abs(tw.length - qw.length) <= 2) {
                                return getTypoDistance(qw, tw) <= (qw.length <= 5 ? 1 : 2);
                            }
                            return false;
                        });
                    });
                }
                
                let matchSeeking = activeFilters.seeking ? (p.market === 'seeking') : true;
                let matchBarolo = activeFilters.barolo ? p.wines.some(w => w.name.toLowerCase().includes('barolo')) : true;
                let matchBio = activeFilters.bio ? (p.certifications.includes('Organic winery') || p.certifications.includes('Green Experience') || p.wines.some(w => w.organic)) : true;
                return matchText && matchSeeking && matchBarolo && matchBio;
            });

            if (activeSort === 'az') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (activeSort === 'city') {
                filtered.sort((a, b) => a.city.localeCompare(b.city));
            } else {
                filtered.sort((a, b) => parseInt(a.desk) - parseInt(b.desk));
            }

            let totalWines = filtered.reduce((acc, p) => acc + p.wines.length, 0);
            document.getElementById('main-counter').textContent = `${filtered.length} producers \u2022 ${totalWines} wines`;

            if(filtered.length === 0) {
                grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
                    <svg><use href="#icon-search"></use></svg>
                    <h3>No results</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>`;
                return;
            }

            grid.innerHTML = filtered.map(p => {
                let marketBadge = p.market === 'seeking' 
                    ? `<span class="status-badge seeking"><span class="dot"></span>Seeking importer</span>` 
                    : `<span class="status-badge imported"><span class="dot"></span>Importer: ${p.importer}</span>`;
                return `
                <div class="producer-card" onclick="window.openProducerById('${p.id}')">
                    <div class="card-top">
                        <span class="card-region">${p.region}, ${p.city}</span>
                        <span class="card-table">Table <strong>${p.desk}</strong></span>
                    </div>
                    <div class="card-title-row">
                        <svg viewBox="0 0 100 100" class="grid-logo-svg">
                            <rect width="100" height="100" fill="#f5f5f5"/>
                            <text x="50" y="55" font-family="sans-serif" font-size="24" fill="#9E804E" text-anchor="middle" font-weight="bold">${p.name.charAt(0)}</text>
                        </svg>
                        <h3 class="card-title">${p.name}</h3>
                    </div>
                    <div class="card-status">${marketBadge}</div>
                    <div class="card-bottom">
                        <span>${p.wines.length} wines</span>
                        <span class="view-link">View producer &rarr;</span>
                    </div>
                </div>`;
            }).join('');
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
            
            const actionBtn = document.getElementById('notebook-actions');
            if(actionBtn) actionBtn.style.display = count > 0 ? 'block' : 'none';
        }

        function renderNotebook() {
            const container = document.getElementById('notebook-list');
            const savedIds = Object.keys(savedWines);
            
            if (savedIds.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                    <svg><use href="#icon-heart"></use></svg>
                    <h3>No wines saved</h3>
                    <p>Explore the producers and tap the heart icon to save your tasting notes here.</p>
                </div>`;
                document.getElementById('notebook-actions').style.display = 'none';
                return;
            }
            
            document.getElementById('notebook-actions').style.display = 'block';

            container.innerHTML = savedIds.map(id => {
                let foundWine = null; let foundProducer = null;
                producers.forEach(p => { p.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = p; } }); });
                if(!foundWine) {
                    eventData.masterclasses.forEach(mc => { mc.wines.forEach(w => { if(w.id === id) { foundWine = w; foundProducer = {id: w.producerId, name: w.producerName + ' (MC)'}; } }); });
                }
                
                if (foundWine) {
                    let organicHtml = foundWine.organic ? `<svg class="grape-icon inline"><use href="#icon-grape"></use></svg>` : '';
                    let vintageText = foundWine.vintage !== 'NV' ? ` ${foundWine.vintage}` : '';
                    
                    return `
                    <div class="wine-item">
                        <button class="heart-btn active" data-wine-id="${foundWine.id}">
                            <svg><use href="#icon-heart-filled"></use></svg>
                        </button>
                        <div class="wine-header" onclick="window.openProducerById('${foundProducer.id}')">
                            <div style="color:var(--brand); font-weight:700; margin-bottom:4px; font-size:11px; text-transform:uppercase;">${foundProducer.name}</div>
                            <div class="wine-name">
                                ${foundWine.name}${vintageText} 
                                ${organicHtml}
                            </div>
                            <div class="wine-meta"><span class="wine-type-badge ${foundWine.color || 'red'}"></span> ${foundWine.type}</div>
                        </div>
                        <textarea class="wine-note-input" data-wine-id="${foundWine.id}" placeholder="Tasting notes...">${wineNotes[foundWine.id] || ''}</textarea>
                    </div>`;
                }
                return '';
            }).join('');
            attachWineListeners(container);
        }
        
        function renderMasterclasses() {
            const mcContainer = document.getElementById('masterclass-list');
            
            if (!eventData.masterclasses || eventData.masterclasses.length === 0) {
                mcContainer.innerHTML = `<div class="empty-state"><p>No masterclasses scheduled.</p></div>`;
                return;
            }

            mcContainer.innerHTML = eventData.masterclasses.map(mc => {
                let winesHtml = mc.wines.map(w => {
                    let isSaved = !!savedWines[w.id];
                    return `
                    <div class="mc-wine-row" onclick="window.openProducerById('${w.producerId}')">
                        <div class="mc-wine-info">
                            <strong>${w.producerName}</strong>
                            <span>
                                <span class="wine-type-badge ${w.color || 'red'}"></span>
                                ${w.name} ${w.vintage} &bull; Table ${w.table}
                            </span>
                        </div>
                        <button class="heart-btn ${isSaved ? 'active' : ''}" style="position:static;" data-wine-id="${w.id}">
                            <svg><use href="${isSaved ? '#icon-heart-filled' : '#icon-heart'}"></use></svg>
                        </button>
                    </div>`
                }).join('');
                
                return `
                <div class="mc-card">
                    <div class="mc-header">
                        <div class="mc-time">${mc.time}</div>
                        <h3 class="mc-title">${mc.title}</h3>
                        <p class="mc-speaker">${mc.speaker}</p>
                        <p class="mc-target">${mc.target}</p>
                    </div>
                    <div class="mc-wines">${winesHtml}</div>
                </div>`;
            }).join('');
            attachWineListeners(mcContainer);
        }
        
        // iCal
        document.getElementById('btn-calendar-ics').addEventListener('click', () => {
            const icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Barolo & Friends Oslo\nDTSTART:20260831T130000Z\nDTEND:20260831T200000Z\nLOCATION:Gamle Logen, Oslo\nEND:VEVENT\nEND:VCALENDAR";
            const blob = new Blob([icsData], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'barolo_friends_oslo.ics'; a.click();
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
        document.getElementById('pwa-close-btn').addEventListener('click', () => {
            pwaBanner.style.display = 'none';
        });

        // Init Setup
        updateNotebookCount();
        renderProducers();
        renderMasterclasses();
        renderNotebook();
    } catch (error) {
        console.error("Error in app.js:", error);
    }
});
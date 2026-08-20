/* =========================================================
   user.js – Painel do Usuário (iaxo-feed)
   ========================================================= */

/* ---------------------------------------------------------
   1. Verificação de login ao carregar a página
   --------------------------------------------------------- */
(function () {
    var user = JSON.parse(localStorage.getItem('iaxo_user'));

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    if (user.role !== 'user') {
        window.location.href = 'admin.html';
        return;
    }
})();

/* ---------------------------------------------------------
   2. Navegação entre páginas
   --------------------------------------------------------- */
function showPage(page) {
    var i;

    // Esconder todas as páginas
    var pages = document.querySelectorAll('.page-content');
    for (i = 0; i < pages.length; i++) {
        pages[i].classList.add('hidden');
    }

    // Mostrar a página selecionada
    var target = document.getElementById('page-' + page);
    if (target) {
        target.classList.remove('hidden');
    }

    // Atualizar estado ativo nos links de navegação
    var navItems = document.querySelectorAll('.nav-item');
    for (i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
    }

    var activeNav = document.querySelector('[data-page="' + page + '"]');
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Atualizar o título da página
    var titles = {
        dashboard: 'Dashboard',
        campanhas: 'Campanhas',
        leads: 'Meus Leads',
        solicitar: 'Solicitar Campanha',
        pagamentos: 'Pagamentos',
        chat: 'Suporte'
    };

    document.getElementById('pageTitle').textContent = titles[page] || page;
    // Sync bottom nav
    var bniMap = { dashboard: 0, campanhas: 1, leads: 2, solicitar: 3, chat: 4 };
    document.querySelectorAll('.pbn-item').forEach(function(b, i) { b.classList.toggle('active', i === bniMap[page]); });
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        var sb = document.getElementById('sidebar');
        if (sb && sb.classList.contains('open')) {
            sb.classList.remove('open');
            var ov = document.getElementById('sidebarOverlay');
            if (ov) ov.style.display = 'none';
        }
    }
}

/* ---------------------------------------------------------
   3. Toggle da sidebar (mobile)
   --------------------------------------------------------- */
function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    sb.classList.toggle('open');
    var overlay = document.getElementById('sidebarOverlay');
    if (sb.classList.contains('open')) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99;display:none;';
            overlay.onclick = function() { toggleSidebar(); };
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'block';
    } else {
        if (overlay) overlay.style.display = 'none';
    }
}

/* ---------------------------------------------------------
   4. Toggle do painel de notificações
   --------------------------------------------------------- */
function toggleNotifications() {
    document.getElementById('notifPanel').classList.toggle('open');
}

/* ---------------------------------------------------------
   5. Toast notifications com animação de slide
   --------------------------------------------------------- */
function showToast(text, type) {
    type = type || 'success';

    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');

    toast.className = 'toast ' + type;

    var iconClass = (type === 'success') ? 'check-circle' : 'info-circle';
    toast.innerHTML =
        '<i class="fas fa-' + iconClass + '"></i>' +
        '<span>' + text + '</span>';

    container.appendChild(toast);

    // Remover após 4 segundos com animação
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';

        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 4000);
}

/* ---------------------------------------------------------
   6. Submissão do formulário de campanha
   --------------------------------------------------------- */
function submitCampaign(e) {
    e.preventDefault();

    showToast('Campanha enviada! Em até 10 minutos estará no ar.', 'success');

    // Limpar formulário e mídia
    e.target.reset();
    removeMedia();

    document.getElementById('summaryBudget').textContent = 'R$ 0,00';
}

/* ---------------------------------------------------------
   7. Listener do input de orçamento
   --------------------------------------------------------- */
function initBudgetListener() {
    var budgetInput = document.getElementById('campaignBudget');

    if (budgetInput) {
        budgetInput.addEventListener('input', function () {
            var value = parseFloat(this.value) || 0;
            var formatted = 'R$ ' + value.toFixed(2).replace('.', ',');
            document.getElementById('summaryBudget').textContent = formatted;
        });
    }
}

/* ---------------------------------------------------------
   8. Alternar entre modos de mídia (upload / gerar)
   --------------------------------------------------------- */
function toggleMediaMode(mode) {
    var uploadArea = document.getElementById('uploadArea');
    var generateArea = document.getElementById('generateArea');
    var btnUpload = document.getElementById('mmUpload');
    var btnGenerate = document.getElementById('mmGenerate');

    // Mostrar/esconder áreas
    if (mode === 'upload') {
        uploadArea.classList.remove('hidden');
        generateArea.classList.add('hidden');
    } else {
        uploadArea.classList.add('hidden');
        generateArea.classList.remove('hidden');
    }

    // Atualizar estado ativo dos botões
    if (mode === 'upload') {
        btnUpload.classList.add('active');
        btnGenerate.classList.remove('active');
    } else {
        btnUpload.classList.remove('active');
        btnGenerate.classList.add('active');
    }
}

/* ---------------------------------------------------------
   9. Upload e preview de mídia
   --------------------------------------------------------- */
function handleMediaUpload(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];

        document.getElementById('mediaFileName').textContent = file.name;
        document.getElementById('mediaPreview').classList.remove('hidden');
        document.getElementById('dropzone').style.display = 'none';
    }
}

/* ---------------------------------------------------------
   10. Drag and drop
   --------------------------------------------------------- */
function handleDrop(e) {
    e.preventDefault();

    var file = e.dataTransfer.files[0];

    if (file) {
        var fileInput = document.getElementById('mediaFile');
        fileInput.files = e.dataTransfer.files;
        handleMediaUpload(fileInput);
    }
}

/* ---------------------------------------------------------
   11. Remover mídia enviada
   --------------------------------------------------------- */
function removeMedia() {
    var preview = document.getElementById('mediaPreview');
    var dropzone = document.getElementById('dropzone');
    var fileInput = document.getElementById('mediaFile');
    if (preview) preview.classList.add('hidden');
    if (dropzone) dropzone.style.display = '';
    if (fileInput) fileInput.value = '';
}

/* ---------------------------------------------------------
   12. Solicitar PIX
   --------------------------------------------------------- */
function requestPix() {
    var amountInput = document.getElementById('campaignAmount');
    var amount = amountInput.value;

    if (!amount) {
        showToast('Informe o valor.', 'warning');
        return;
    }

    document.getElementById('pixResult').classList.remove('hidden');
    showToast('PIX gerado! R$ ' + parseFloat(amount).toFixed(2), 'success');
}

/* ---------------------------------------------------------
   13. Chat do usuário com respostas automáticas
   --------------------------------------------------------- */
function sendUserChat() {
    var input = document.getElementById('userChatInput');
    var text = input.value.trim();

    if (!text) {
        return;
    }

    var chatMessages = document.getElementById('userChatMessages');

    // Hora atual formatada
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var timeStr = hours + ':' + minutes;

    // Adicionar mensagem do usuário
    chatMessages.innerHTML +=
        '<div class="chat-message sent">' +
            '<div class="message-bubble">' + text + '</div>' +
            '<span class="message-time">' + timeStr + '</span>' +
        '</div>';

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Resposta automática após 1.2 segundos
    setTimeout(function () {
        var replies = [
            'Verificando agora!',
            'Suas campanhas estão no ar!',
            'Custo do lead caiu 12%!',
            'Leads sendo entregues via WhatsApp!',
            'Tudo certo com sua assinatura!'
        ];

        var randomReply = replies[Math.floor(Math.random() * replies.length)];

        chatMessages.innerHTML +=
            '<div class="chat-message received">' +
                '<div class="message-bubble">' + randomReply + '</div>' +
                '<span class="message-time">' + timeStr + '</span>' +
            '</div>';

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1200);
}

/* ---------------------------------------------------------
   14. Filter tabs – clique em todos os grupos
   --------------------------------------------------------- */
function initFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
            // Remover active de todos os tabs do mesmo grupo
            var siblings = this.parentElement.querySelectorAll('.filter-tab');
            for (var j = 0; j < siblings.length; j++) {
                siblings[j].classList.remove('active');
            }

            // Adicionar active ao tab clicado
            this.classList.add('active');
        });
    }
}

/* ---------------------------------------------------------
   15. Gráfico de leads por dia (Chart.js – barras empilhadas)
   --------------------------------------------------------- */
function initChart() {
    var canvas = document.getElementById('leadsChart');

    if (!canvas || typeof Chart === 'undefined') {
        return;
    }

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [
                {
                    label: 'Instagram',
                    data: [12, 18, 15, 22, 28, 19, 14],
                    backgroundColor: 'rgba(225, 48, 108, 0.6)',
                    borderRadius: 6
                },
                {
                    label: 'Google',
                    data: [8, 12, 10, 14, 16, 11, 9],
                    backgroundColor: 'rgba(66, 133, 244, 0.6)',
                    borderRadius: 6
                },
                {
                    label: 'Facebook',
                    data: [5, 7, 6, 8, 10, 7, 5],
                    backgroundColor: 'rgba(24, 119, 242, 0.6)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#A0A0C0',
                        usePointStyle: true,
                        padding: 14
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(42, 42, 74, 0.3)' },
                    ticks: { color: '#6B6B8D' },
                    stacked: true
                },
                y: {
                    grid: { color: 'rgba(42, 42, 74, 0.3)' },
                    ticks: { color: '#6B6B8D' },
                    stacked: true
                }
            }
        }
    });
}

/* ---------------------------------------------------------
   16. Simulação de leads em tempo real
   --------------------------------------------------------- */
function simulateRealtime() {
    var events = [
        { text: 'Novo lead: Patrícia Mendes via Instagram', type: 'success' },
        { text: 'Lead via Google: Fernando Costa - R$ 13,48', type: 'info' },
        { text: 'Custo médio caiu para R$ 17,80', type: 'success' }
    ];

    setInterval(function () {
        var event = events[Math.floor(Math.random() * events.length)];
        showToast(event.text, event.type);
    }, 12000);
}

/* ---------------------------------------------------------
   17. Filtro de busca – filtrar linhas da tabela de leads
   --------------------------------------------------------- */
function initSearchFilter() {
    var searchInput = document.getElementById('searchInput');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', function () {
        var query = this.value.toLowerCase();
        var rows = document.querySelectorAll('#leadsTable tbody tr');

        for (var i = 0; i < rows.length; i++) {
            var text = rows[i].textContent.toLowerCase();
            rows[i].style.display = (text.indexOf(query) !== -1) ? '' : 'none';
        }
    });
}

/* ---------------------------------------------------------
   18. Filtrar leads por fonte (Instagram, Google, Facebook)
   --------------------------------------------------------- */
function initLeadSourceFilter() {
    var sourceTabs = document.querySelectorAll('.leads-filter .filter-tab');

    for (var i = 0; i < sourceTabs.length; i++) {
        sourceTabs[i].addEventListener('click', function () {
            var source = this.getAttribute('data-source') || this.textContent.trim();
            var rows = document.querySelectorAll('#leadsTable tbody tr');

            for (var j = 0; j < rows.length; j++) {
                var rowSource = rows[j].getAttribute('data-source') || '';

                if (source === 'Todos' || rowSource === source) {
                    rows[j].style.display = '';
                } else {
                    rows[j].style.display = 'none';
                }
            }
        });
    }
}

/* ---------------------------------------------------------
   19. Filtrar cards de campanha por status
   --------------------------------------------------------- */
function initCampaignFilter() {
    var campaignTabs = document.querySelectorAll('.campaigns-filter .filter-tab');

    for (var i = 0; i < campaignTabs.length; i++) {
        campaignTabs[i].addEventListener('click', function () {
            var status = this.getAttribute('data-status') || this.textContent.trim();
            var cards = document.querySelectorAll('.campaign-card');

            for (var j = 0; j < cards.length; j++) {
                var cardStatus = cards[j].getAttribute('data-status') || '';

                if (status === 'Todos' || cardStatus === status) {
                    cards[j].style.display = '';
                } else {
                    cards[j].style.display = 'none';
                }
            }
        });
    }
}

/* ---------------------------------------------------------
   20. Avatar Upload
   --------------------------------------------------------- */
function handleAvatarUpload(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        if (file.size > 2 * 1024 * 1024) {
            showToast('Imagem muito grande. Máximo 2MB.', 'warning');
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var avatar = document.getElementById('userAvatar');
            var text = document.getElementById('avatarText');
            if (avatar && text) {
                text.style.display = 'none';
                var existing = avatar.querySelector('img');
                if (existing) existing.remove();
                var img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Avatar';
                avatar.appendChild(img);
                localStorage.setItem('iaxo_avatar', e.target.result);
            }
            showToast('Foto de perfil atualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function loadAvatar() {
    var saved = localStorage.getItem('iaxo_avatar');
    if (saved) {
        var avatar = document.getElementById('userAvatar');
        var text = document.getElementById('avatarText');
        if (avatar && text) {
            text.style.display = 'none';
            var existing = avatar.querySelector('img');
            if (existing) existing.remove();
            var img = document.createElement('img');
            img.src = saved;
            img.alt = 'Avatar';
            avatar.appendChild(img);
        }
    }
}

/* ---------------------------------------------------------
   21. LOGOUT
   --------------------------------------------------------- */
function logout() {
    localStorage.removeItem('iaxo_user');
    localStorage.removeItem('iaxo_avatar');
    if (typeof auth !== 'undefined') {
        auth.signOut().then(function() {
            window.location.href = 'login.html';
        }).catch(function() {
            window.location.href = 'login.html';
        });
    } else {
        window.location.href = 'login.html';
    }
}

/* ---------------------------------------------------------
   22. Carregar dados do usuário do Firestore
   --------------------------------------------------------- */
function loadUserData() {
    var localUser = JSON.parse(localStorage.getItem('iaxo_user'));
    if (!localUser) return;

    // Update sidebar with user data
    var userNameEl = document.getElementById('sidebarUserName');
    var userRoleEl = document.getElementById('sidebarUserRole');
    var welcomeH2 = document.querySelector('.welcome-text h2');
    var welcomeP = document.querySelector('.welcome-text p');

    if (userNameEl) userNameEl.textContent = localUser.name || 'Usuário';
    if (userRoleEl) userRoleEl.textContent = localUser.business || localUser.niche || 'Plano Premium';

    // Personalize welcome message
    var firstName = (localUser.name || 'Usuário').split(' ')[0];
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    if (welcomeH2) welcomeH2.textContent = greeting + ', ' + firstName + '!';
    if (welcomeP) welcomeP.textContent = 'Seus anúncios estão gerando leads qualificados. Resumo de hoje:';

    // Try to load fresh data from Firestore
    if (typeof db !== 'undefined' && localUser.uid) {
        db.collection('users').doc(localUser.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    var data = doc.data();
                    // Update local storage with fresh data
                    localUser.name = data.name || localUser.name;
                    localUser.business = data.business || localUser.business;
                    localUser.niche = data.niche || localUser.niche;
                    localStorage.setItem('iaxo_user', JSON.stringify(localUser));
                    // Update UI
                    if (userNameEl) userNameEl.textContent = data.name || localUser.name;
                    if (userRoleEl) userRoleEl.textContent = data.business || data.niche || 'Plano Premium';
                    var fn = (data.name || localUser.name).split(' ')[0];
                    if (welcomeH2) welcomeH2.textContent = greeting + ', ' + fn + '!';
                    
                    // Update avatar initials
                    var initials = (data.name || localUser.name).split(' ').map(function(w) { return w[0] || ''; }).join('').substring(0, 2).toUpperCase();
                    var avatarText = document.getElementById('avatarText');
                    if (avatarText && !document.querySelector('#userAvatar img')) {
                        avatarText.textContent = initials;
                    }
                }
            })
            .catch(function() {
                // Use local data
            });
    }
}

/* ---------------------------------------------------------
   23. Inicialização ao carregar a janela
   --------------------------------------------------------- */
window.addEventListener('load', function () {
    loadUserData();
    initChart();
    simulateRealtime();
    initBudgetListener();
    initFilterTabs();
    initSearchFilter();
    initLeadSourceFilter();
    initCampaignFilter();
    loadAvatar();
    // Hide admin link for non-admin users
    var user = JSON.parse(localStorage.getItem('iaxo_user'));
    var adminLink = document.getElementById('adminAccessLink');
    if (adminLink && (!user || user.role !== 'admin')) {
        adminLink.style.display = 'none';
    }
});

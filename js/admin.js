// ==========================================
// ADMIN PANEL JS - IAXO Feed
// ==========================================

// Login Check
(function() {
    var user = JSON.parse(localStorage.getItem('iaxo_user'));
    if (!user) { window.location.href = 'login.html'; return; }
    if (user.role !== 'admin') { window.location.href = 'usuario.html'; return; }
})();

// Navigation
function showPage(page) {
    document.querySelectorAll('.page-content').forEach(function(p) { p.classList.add('hidden'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navItem = document.querySelector('[data-page="' + page + '"]');
    if (navItem) navItem.classList.add('active');
    var titles = {
        dashboard: 'Dashboard', usuarios: 'Gerenciar Usuários', campanhas: 'Campanhas',
        fila: 'Fila de Campanhas', leads: 'Leads', pagamentos: 'Pagamentos',
        chat: 'Suporte', config: 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
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

function toggleNotifications() {
    document.getElementById('notifPanel').classList.toggle('open');
}

// Modals
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// ==========================================
// USERS CRUD
// ==========================================

var users = [
    { id: 1, name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 99999-9999', business: 'Clínica Renova', niche: 'Saúde', plan: 'Premium', status: 'active', leads: 342, gradient: 'var(--gradient-1)', initials: 'CS' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-8888', business: 'E-Shop Brasil', niche: 'E-commerce', plan: 'Premium', status: 'active', leads: 567, gradient: 'var(--gradient-2)', initials: 'MS' },
    { id: 3, name: 'Pedro Lima', email: 'pedro@email.com', phone: '(11) 97777-7777', business: 'Imobiliária Horizonte', niche: 'Imobiliário', plan: 'Premium', status: 'pending', leads: 0, gradient: 'var(--gradient-3)', initials: 'PL' },
    { id: 4, name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 96666-6666', business: 'Studio Beleza', niche: 'Estética', plan: 'Premium', status: 'active', leads: 189, gradient: 'linear-gradient(135deg,#FF6B6B,#FFB347)', initials: 'AC' },
    { id: 5, name: 'Ricardo Oliveira', email: 'ricardo@email.com', phone: '(11) 95555-5555', business: 'Finanzas Pro', niche: 'Finanças', plan: 'Premium', status: 'inactive', leads: 45, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', initials: 'RO' },
];

var editingUserId = null;

function renderUsers(filter) {
    filter = filter || 'all';
    var tbody = document.getElementById('usersTable');
    if (!tbody) return;
    var html = '';
    users.forEach(function(user) {
        if (filter !== 'all' && user.status !== filter) return;
        html += '<tr data-user-id="' + user.id + '">';
        html += '<td><div class="user-cell"><div class="avatar-circle small" style="background:' + user.gradient + '">' + user.initials + '</div><div><strong>' + user.name + '</strong><br><span class="text-muted">' + user.email + '</span></div></div></td>';
        html += '<td>' + user.business + '</td>';
        html += '<td><span class="tag">' + user.niche + '</span></td>';
        html += '<td><span class="tag premium">' + user.plan + '</span></td>';
        html += '<td><span class="status-badge ' + user.status + '">' + (user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo') + '</span></td>';
        html += '<td>' + user.leads + '</td>';
        html += '<td class="actions-cell">';
        html += '<button class="btn-icon" title="Editar" onclick="editUser(' + user.id + ')"><i class="fas fa-pen"></i></button> ';
        html += '<button class="btn-icon danger" title="Excluir" onclick="deleteUser(' + user.id + ')"><i class="fas fa-trash"></i></button>';
        html += '</td></tr>';
    });
    tbody.innerHTML = html;
}

function filterUsers(query) {
    query = (query || '').toLowerCase();
    var rows = document.querySelectorAll('#usersTable tr');
    rows.forEach(function(row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(query) !== -1 ? '' : 'none';
    });
}

function filterUsersByStatus(status) {
    renderUsers(status);
}

function editUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (!user) return;
    editingUserId = id;
    var modal = document.getElementById('editUserModal');
    modal.querySelector('[data-field="name"]').value = user.name;
    modal.querySelector('[data-field="email"]').value = user.email;
    modal.querySelector('[data-field="business"]').value = user.business;
    modal.querySelector('[data-field="phone"]').value = user.phone || '';
    modal.querySelector('[data-field="status"]').value = user.status;
    modal.querySelector('[data-field="plan"]').value = user.plan.toLowerCase();
    modal.querySelector('[data-field="niche"]').value = user.niche;
    openModal('editUserModal');
}

function saveEditUser() {
    if (!editingUserId) return;
    var user = users.find(function(u) { return u.id === editingUserId; });
    if (!user) return;
    var modal = document.getElementById('editUserModal');
    user.name = modal.querySelector('[data-field="name"]').value;
    user.email = modal.querySelector('[data-field="email"]').value;
    user.business = modal.querySelector('[data-field="business"]').value;
    user.phone = modal.querySelector('[data-field="phone"]').value;
    user.status = modal.querySelector('[data-field="status"]').value;
    user.plan = modal.querySelector('[data-field="plan"]').value === 'premium' ? 'Premium' : 'Básico';
    user.niche = modal.querySelector('[data-field="niche"]').value;
    user.initials = user.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
    renderUsers();
    closeModal('editUserModal');
    showToast('Usuário "' + user.name + '" atualizado com sucesso!', 'success');
    editingUserId = null;
}

function deleteUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (!user) return;
    if (!confirm('Tem certeza que deseja excluir o usuário "' + user.name + '"?')) return;
    users = users.filter(function(u) { return u.id !== id; });
    renderUsers();
    showToast('Usuário "' + user.name + '" excluído com sucesso.', 'success');
}

function createUser() {
    var modal = document.getElementById('newUserModal');
    var name = modal.querySelector('[data-field="name"]').value.trim();
    var email = modal.querySelector('[data-field="email"]').value.trim();
    var business = modal.querySelector('[data-field="business"]').value.trim();
    var phone = modal.querySelector('[data-field="phone"]').value.trim();
    var niche = modal.querySelector('[data-field="niche"]').value;
    var password = modal.querySelector('[data-field="password"]').value;
    if (!name || !email || !business) {
        showToast('Preencha nome, e-mail e negócio.', 'warning');
        return;
    }
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
    var gradients = ['var(--gradient-1)', 'var(--gradient-2)', 'var(--gradient-3)', 'linear-gradient(135deg,#FF6B6B,#FFB347)', 'linear-gradient(135deg,#667eea,#764ba2)'];
    var newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        business: business,
        niche: niche,
        plan: 'Premium',
        status: 'pending',
        leads: 0,
        gradient: gradients[Math.floor(Math.random() * gradients.length)],
        initials: initials
    };
    users.push(newUser);
    renderUsers();
    modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
    closeModal('newUserModal');
    showToast('Usuário "' + name + '" criado com sucesso!', 'success');
    updateCounts();
}

function updateCounts() {
    var activeCount = users.filter(function(u) { return u.status === 'active'; }).length;
    var navCount = document.querySelector('[data-page="usuarios"] .nav-count');
    if (navCount) navCount.textContent = users.length;
}

// ==========================================
// CAMPAIGN APPROVAL
// ==========================================

function approveCampaign(btn) {
    var item = btn.closest('.pending-item');
    item.style.transition = 'all 0.5s ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(30px)';
    showToast('Campanha aprovada! Entrará no ar em até 10 minutos.', 'success');
    setTimeout(function() { item.remove(); }, 500);
}

function approveCampaignCard(btn) {
    var card = btn.closest('.campaign-card');
    var statusEl = card.querySelector('.campaign-status');
    statusEl.className = 'campaign-status on-air';
    statusEl.innerHTML = '<i class="fas fa-circle"></i> No Ar';
    btn.closest('.campaign-actions-pending').innerHTML = '<span style="color:var(--secondary);font-size:13px"><i class="fas fa-check-circle"></i> Campanha no ar!</span>';
    showToast('Campanha aprovada e publicada!', 'success');
}

// Fila de Campanhas
function startCreation(btn) {
    var item = btn.closest('.fila-item');
    var right = item.querySelector('.fila-item-right');
    var priority = item.querySelector('.fila-priority');
    priority.className = 'fila-priority progress';
    priority.textContent = 'Em Criação';
    right.innerHTML = '<div class="fila-progress-badge"><i class="fas fa-spinner fa-spin"></i> Criando...</div><div class="fila-time">Iniciado agora</div>';
    item.classList.add('in-progress');
    showToast('Iniciando criação da campanha...', 'info');
}

function approveFilaItem(btn) {
    var item = btn.closest('.fila-item');
    item.style.transition = 'all 0.5s ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(30px)';
    showToast('Campanha aprovada! Entrará no ar em até 10 minutos.', 'success');
    setTimeout(function() { item.remove(); }, 500);
}

// ==========================================
// PIX
// ==========================================

function copyPix(btn) {
    var code = '00020126360014BR.GOV.BCB.PIX0136iaxo-admin@email.com5204000053039865405197.00582BR5925IAXO Feed Administracao6009SAO PAULO62070503***6304';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function() {
            showToast('Código PIX copiado!', 'success');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Código PIX copiado!', 'success');
    }
}

// ==========================================
// TOAST
// ==========================================

function showToast(text, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    toast.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + text + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = '0.3s';
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
}

// ==========================================
// CHAT
// ==========================================

function sendChatMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();
    if (!text) return;
    var container = document.getElementById('chatMessages');
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    container.innerHTML += '<div class="chat-message sent"><div class="message-bubble">' + escapeHtml(text) + '</div><span class="message-time">' + time + '</span></div>';
    input.value = '';
    container.scrollTop = container.scrollHeight;
    setTimeout(function() {
        var replies = [
            'Entendi! Vou verificar agora.',
            'Perfeito, obrigado pelo retorno!',
            'Certo, vou resolver isso para você.',
            'Obrigado pelo contato! Qualquer dúvida estou aqui.',
            'Vou conferir os dados da campanha e já volto.',
        ];
        var reply = replies[Math.floor(Math.random() * replies.length)];
        container.innerHTML += '<div class="chat-message received"><div class="message-bubble">' + reply + '</div><span class="message-time">' + time + '</span></div>';
        container.scrollTop = container.scrollHeight;
    }, 1500);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ==========================================
// LEADS
// ==========================================

function filterLeads(query) {
    query = (query || '').toLowerCase();
    var rows = document.querySelectorAll('#leadsTable tr');
    rows.forEach(function(row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(query) !== -1 ? '' : 'none';
    });
}

function sendLead(btn) {
    var row = btn.closest('tr');
    var name = row.querySelector('strong').textContent;
    row.querySelector('.status-badge').className = 'status-badge active';
    row.querySelector('.status-badge').textContent = 'Enviado';
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.disabled = true;
    showToast('Lead "' + name + '" marcado como enviado!', 'success');
}

// ==========================================
// FILTER TABS
// ==========================================

document.querySelectorAll('.filter-tabs').forEach(function(tabGroup) {
    tabGroup.querySelectorAll('.filter-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabGroup.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
        });
    });
});

// ==========================================
// CHART
// ==========================================

function initChart() {
    var ctx = document.getElementById('revenueChart');
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Receita (R$)',
                data: [5200, 7800, 6400, 8900, 12300, 9800, 11200],
                borderColor: '#6C3CE1',
                backgroundColor: 'rgba(108, 60, 225, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6C3CE1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#12122A',
                    titleColor: '#fff',
                    bodyColor: '#A0A0C0',
                    borderColor: '#2A2A4A',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: { label: function(ctx) { return 'R$ ' + ctx.parsed.y.toLocaleString(); } }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(42,42,74,0.3)' }, ticks: { color: '#6B6B8D' } },
                y: { grid: { color: 'rgba(42,42,74,0.3)' }, ticks: { color: '#6B6B8D', callback: function(v) { return 'R$ ' + v.toLocaleString(); } } }
            }
        }
    });
}

// ==========================================
// REALTIME NOTIFICATIONS
// ==========================================

function simulateRealtime() {
    var events = [
        'Novo lead: Pedro Alves - Instagram (Clínica Renova)',
        'Campanha "Delivery Premium" aprovada automaticamente',
        'Lead convertido: Fernanda Lima comprou via WhatsApp',
        'Pagamento PIX confirmado - R$ 197 - Maria Santos',
        'Nova campanha criada por Carlos Silva - Aguardando aprovação',
        'Lead qualificado via Google - Banco Invest - R$ 28,50',
    ];
    setInterval(function() {
        var event = events[Math.floor(Math.random() * events.length)];
        showToast(event, 'success');
    }, 20000);
}

// ==========================================
// CONFIG
// ==========================================

function saveConfig() {
    showToast('Configurações salvas com sucesso!', 'success');
}

// ==========================================
// INIT
// ==========================================

window.addEventListener('load', function() {
    renderUsers();
    initChart();
    simulateRealtime();
});

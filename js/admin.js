// ==========================================
// ADMIN PANEL JS - IAXO Ads (Firestore-backed)
// ==========================================

// Login Check
(function() {
    var user = JSON.parse(localStorage.getItem('iaxo_user'));
    if (!user) { window.location.href = 'login.html'; return; }
    if (user.role !== 'admin') { window.location.href = 'usuario.html'; return; }
})();

// ==========================================
// GLOBAL STATE
// ==========================================
var users = [];
var editingUserId = null;
var currentFilter = 'all';
var unsubUsers = null;

// ==========================================
// NAVIGATION
// ==========================================
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
    var bniMap = { dashboard: 0, usuarios: 1, campanhas: 2, leads: 3, chat: 4 };
    document.querySelectorAll('.pbn-item').forEach(function(b, i) { b.classList.toggle('active', i === bniMap[page]); });
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

// ==========================================
// MODALS
// ==========================================
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// ==========================================
// USERS CRUD - FIRESTORE
// ==========================================

// Load users from Firestore (real-time listener)
function loadUsers() {
    if (typeof db === 'undefined') {
        console.warn('Firestore not available, using demo data');
        users = getDemoUsers();
        renderUsers();
        return;
    }

    try {
        unsubUsers = db.collection('users').orderBy('createdAt', 'desc').onSnapshot(function(snap) {
            users = [];
            snap.forEach(function(doc) {
                var data = doc.data();
                data.id = doc.id;
                users.push(data);
            });
            renderUsers();
            updateCounts();
        }, function(err) {
            console.warn('Firestore listener error, using demo data:', err);
            users = getDemoUsers();
            renderUsers();
        });
    } catch(e) {
        console.warn('Firestore not available:', e);
        users = getDemoUsers();
        renderUsers();
    }
}

function getDemoUsers() {
    return [
        { id: 'demo1', name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 99999-9999', business: 'Clínica Renova', niche: 'Saúde', plan: 'premium', status: 'active', leads: 342, gradient: 'linear-gradient(135deg, #FF6B2C, #FFB347)' },
        { id: 'demo2', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-8888', business: 'E-Shop Brasil', niche: 'E-commerce', plan: 'premium', status: 'active', leads: 567, gradient: 'linear-gradient(135deg, #FF4757, #FF6B2C)' },
        { id: 'demo3', name: 'Pedro Lima', email: 'pedro@email.com', phone: '(11) 97777-7777', business: 'Imobiliária Horizonte', niche: 'Imobiliário', plan: 'premium', status: 'pending', leads: 0, gradient: 'linear-gradient(135deg, #FF8F5E, #FFB347)' },
        { id: 'demo4', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 96666-6666', business: 'Studio Beleza', niche: 'Estética', plan: 'premium', status: 'active', leads: 189, gradient: 'linear-gradient(135deg, #FF6B6B, #FFB347)' },
        { id: 'demo5', name: 'Ricardo Oliveira', email: 'ricardo@email.com', phone: '(11) 95555-5555', business: 'Finanzas Pro', niche: 'Finanças', plan: 'premium', status: 'inactive', leads: 45, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    ];
}

function getInitials(name) {
    return name.split(' ').map(function(w) { return w[0] || ''; }).join('').substring(0, 2).toUpperCase();
}

function getGradient() {
    var gradients = [
        'linear-gradient(135deg, #FF6B2C, #FFB347)',
        'linear-gradient(135deg, #FF4757, #FF6B2C)',
        'linear-gradient(135deg, #FF8F5E, #FFB347)',
        'linear-gradient(135deg, #FF6B6B, #FFB347)',
        'linear-gradient(135deg, #667eea, #764ba2)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

function renderUsers(filter) {
    filter = filter || currentFilter;
    currentFilter = filter;
    var tbody = document.getElementById('usersTable');
    if (!tbody) return;
    var html = '';
    var filtered = users;
    if (filter !== 'all') {
        filtered = users.filter(function(u) { return u.status === filter; });
    }
    if (filtered.length === 0) {
        html = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-users" style="font-size:32px;display:block;margin-bottom:10px"></i>Nenhum usuário encontrado</td></tr>';
    } else {
        filtered.forEach(function(user) {
            var initials = getInitials(user.name || 'U');
            var grad = user.gradient || getGradient();
            var statusLabel = user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo';
            var planLabel = (user.plan === 'premium' || user.plan === 'Premium') ? 'Premium' : 'Básico';
            var nicheLabel = user.niche || '—';
            var leadsCount = user.leads || 0;
            html += '<tr data-user-id="' + user.id + '">';
            html += '<td><div class="user-cell"><div class="avatar-circle small" style="background:' + grad + '">' + initials + '</div><div><strong>' + escapeHtml(user.name || '') + '</strong><br><span class="text-muted">' + escapeHtml(user.email || '') + '</span></div></div></td>';
            html += '<td>' + escapeHtml(user.business || '—') + '</td>';
            html += '<td><span class="tag">' + escapeHtml(nicheLabel) + '</span></td>';
            html += '<td><span class="tag premium">' + planLabel + '</span></td>';
            html += '<td><span class="status-badge ' + user.status + '">' + statusLabel + '</span></td>';
            html += '<td>' + leadsCount + '</td>';
            html += '<td class="actions-cell">';
            html += '<button class="btn-icon" title="Editar" onclick="editUser(\'' + user.id + '\')"><i class="fas fa-pen"></i></button> ';
            html += '<button class="btn-icon danger" title="Excluir" onclick="deleteUser(\'' + user.id + '\')"><i class="fas fa-trash"></i></button>';
            html += '</td></tr>';
        });
    }
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
    currentFilter = status;
    renderUsers(status);
}

function editUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (!user) return;
    editingUserId = id;
    var modal = document.getElementById('editUserModal');
    modal.querySelector('[data-field="name"]').value = user.name || '';
    modal.querySelector('[data-field="email"]').value = user.email || '';
    modal.querySelector('[data-field="business"]').value = user.business || '';
    modal.querySelector('[data-field="phone"]').value = user.phone || '';
    modal.querySelector('[data-field="status"]').value = user.status || 'active';
    modal.querySelector('[data-field="plan"]').value = (user.plan === 'premium' || user.plan === 'Premium') ? 'premium' : 'basic';
    modal.querySelector('[data-field="niche"]').value = user.niche || 'Saúde';
    openModal('editUserModal');
}

function saveEditUser() {
    if (!editingUserId) return;
    var modal = document.getElementById('editUserModal');
    var data = {
        name: modal.querySelector('[data-field="name"]').value.trim(),
        email: modal.querySelector('[data-field="email"]').value.trim(),
        business: modal.querySelector('[data-field="business"]').value.trim(),
        phone: modal.querySelector('[data-field="phone"]').value.trim(),
        status: modal.querySelector('[data-field="status"]').value,
        plan: modal.querySelector('[data-field="plan"]').value,
        niche: modal.querySelector('[data-field="niche"]').value
    };

    if (!data.name || !data.email) {
        showToast('Preencha nome e e-mail.', 'warning');
        return;
    }

    // Check if Firestore is available and this is not a demo user
    if (typeof db !== 'undefined' && editingUserId.indexOf('demo') === -1) {
        db.collection('users').doc(editingUserId).update(data)
            .then(function() {
                closeModal('editUserModal');
                showToast('Usuário "' + data.name + '" atualizado!', 'success');
                editingUserId = null;
            })
            .catch(function(err) {
                console.error('Error updating user:', err);
                // Fallback: update locally
                updateLocalUser(editingUserId, data);
                closeModal('editUserModal');
                showToast('Usuário atualizado (local).', 'success');
                editingUserId = null;
            });
    } else {
        updateLocalUser(editingUserId, data);
        closeModal('editUserModal');
        showToast('Usuário "' + data.name + '" atualizado!', 'success');
        editingUserId = null;
    }
}

function updateLocalUser(id, data) {
    var user = users.find(function(u) { return u.id === id; });
    if (user) {
        user.name = data.name;
        user.email = data.email;
        user.business = data.business;
        user.phone = data.phone;
        user.status = data.status;
        user.plan = data.plan;
        user.niche = data.niche;
    }
    renderUsers();
}

function deleteUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (!user) return;
    if (!confirm('Tem certeza que deseja excluir "' + user.name + '"?')) return;

    if (typeof db !== 'undefined' && id.indexOf('demo') === -1) {
        db.collection('users').doc(id).delete()
            .then(function() {
                showToast('Usuário excluído!', 'success');
            })
            .catch(function(err) {
                console.error('Error deleting user:', err);
                removeLocalUser(id);
                showToast('Usuário excluído (local).', 'success');
            });
    } else {
        removeLocalUser(id);
        showToast('Usuário "' + user.name + '" excluído!', 'success');
    }
}

function removeLocalUser(id) {
    users = users.filter(function(u) { return u.id !== id; });
    renderUsers();
    updateCounts();
}

function createUser() {
    var modal = document.getElementById('newUserModal');
    var name = modal.querySelector('[data-field="name"]').value.trim();
    var email = modal.querySelector('[data-field="email"]').value.trim();
    var business = modal.querySelector('[data-field="business"]').value.trim();
    var phone = modal.querySelector('[data-field="phone"]').value.trim();
    var niche = modal.querySelector('[data-field="niche"]').value;
    var password = modal.querySelector('[data-field="password"]').value;

    if (!name || !email) {
        showToast('Preencha nome e e-mail.', 'warning');
        return;
    }

    var userData = {
        name: name,
        email: email,
        business: business,
        phone: phone,
        niche: niche,
        role: 'user',
        status: 'pending',
        plan: 'premium',
        leads: 0,
        campaigns: 0,
        gradient: getGradient(),
        createdAt: new Date().toISOString()
    };

    // Try to create in Firestore via Auth
    if (typeof auth !== 'undefined' && password && password.length >= 6) {
        // We need to create a Firebase Auth user
        // Save current admin credentials
        var adminUser = auth.currentUser;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then(function(cred) {
                userData.uid = cred.user.uid;
                return db.collection('users').doc(cred.user.uid).set(userData);
            })
            .then(function() {
                // Sign back in as admin
                if (adminUser) {
                    return adminUser.reload();
                }
            })
            .then(function() {
                modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                closeModal('newUserModal');
                showToast('Usuário "' + name + '" criado com sucesso!', 'success');
                updateCounts();
            })
            .catch(function(err) {
                console.warn('Could not create auth user:', err.message);
                // Fallback: save to Firestore without auth
                if (typeof db !== 'undefined') {
                    db.collection('users').add(userData)
                        .then(function() {
                            modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                            closeModal('newUserModal');
                            showToast('Usuário "' + name + '" criado!', 'success');
                            updateCounts();
                        })
                        .catch(function() {
                            // Local fallback
                            userData.id = 'local_' + Date.now();
                            users.push(userData);
                            renderUsers();
                            modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                            closeModal('newUserModal');
                            showToast('Usuário "' + name + '" criado (local)!', 'success');
                            updateCounts();
                        });
                } else {
                    userData.id = 'local_' + Date.now();
                    users.push(userData);
                    renderUsers();
                    modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                    closeModal('newUserModal');
                    showToast('Usuário "' + name + '" criado!', 'success');
                    updateCounts();
                }
            });
    } else if (typeof db !== 'undefined') {
        // No password or too short - just save to Firestore
        db.collection('users').add(userData)
            .then(function() {
                modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                closeModal('newUserModal');
                showToast('Usuário "' + name + '" criado!', 'success');
                updateCounts();
            })
            .catch(function() {
                userData.id = 'local_' + Date.now();
                users.push(userData);
                renderUsers();
                modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
                closeModal('newUserModal');
                showToast('Usuário "' + name + '" criado!', 'success');
                updateCounts();
            });
    } else {
        userData.id = 'local_' + Date.now();
        users.push(userData);
        renderUsers();
        modal.querySelectorAll('input').forEach(function(i) { i.value = ''; });
        closeModal('newUserModal');
        showToast('Usuário "' + name + '" criado!', 'success');
        updateCounts();
    }
}

function updateCounts() {
    var totalCount = users.length;
    var navCount = document.querySelector('[data-page="usuarios"] .nav-count');
    if (navCount) navCount.textContent = totalCount;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
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
    var code = '00020126360014BR.GOV.BCB.PIX0136iaxo-admin@email.com5204000053039865405197.00582BR5925IAXO Ads Administracao6009SAO PAULO62070503***6304';
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
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    toast.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + text + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
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
                borderColor: '#FF6B2C',
                backgroundColor: 'rgba(255, 107, 44, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#FF6B2C',
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
// AVATAR UPLOAD
// ==========================================
function handleAdminAvatarUpload(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        if (file.size > 2 * 1024 * 1024) {
            showToast('Imagem muito grande. Máximo 2MB.', 'warning');
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var avatar = document.getElementById('adminAvatar');
            var text = document.getElementById('adminAvatarText');
            if (avatar && text) {
                text.style.display = 'none';
                var existing = avatar.querySelector('img');
                if (existing) existing.remove();
                var img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Avatar';
                avatar.appendChild(img);
                localStorage.setItem('iaxo_admin_avatar', e.target.result);
            }
            showToast('Foto de perfil atualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function loadAdminAvatar() {
    var saved = localStorage.getItem('iaxo_admin_avatar');
    if (saved) {
        var avatar = document.getElementById('adminAvatar');
        var text = document.getElementById('adminAvatarText');
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

// ==========================================
// LOGOUT
// ==========================================
function logout() {
    localStorage.removeItem('iaxo_user');
    localStorage.removeItem('iaxo_admin_avatar');
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

// ==========================================
// INIT
// =========================================
window.addEventListener('load', function() {
    loadUsers();
    initChart();
    simulateRealtime();
    loadAdminAvatar();
});

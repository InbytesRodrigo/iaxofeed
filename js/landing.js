// ==========================================
// LANDING PAGE JS - IAXO Feed
// ==========================================

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const feedGrid = document.getElementById('feedGrid');
const feedEmpty = document.getElementById('feedEmpty');
const feedEmptyQuery = document.getElementById('feedEmptyQuery');

function setSearch(text) {
    searchInput.value = text;
    searchInput.focus();
    doFeedSearch(text);
    document.getElementById('feed-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

searchBtn.addEventListener('click', function() { doFeedSearch(searchInput.value); });
searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') doFeedSearch(searchInput.value); });
searchInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        showAllFeedCards();
        clearFeedFilters();
    }
});

function doFeedSearch(query) {
    query = query || searchInput.value;
    query = query.trim().toLowerCase();
    if (!query) return;

    document.getElementById('feed-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    clearFeedFilters();

    let found = 0;
    document.querySelectorAll('.feed-card').forEach(function(card) {
        var searchData = (card.getAttribute('data-search') || '') + ' ' + (card.getAttribute('data-niche') || '');
        if (searchData.toLowerCase().indexOf(query) !== -1) {
            card.style.display = '';
            card.style.animation = 'feedFadeIn 0.4s ease';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    if (found === 0) {
        feedEmpty.classList.remove('hidden');
        feedEmptyQuery.textContent = query;
    } else {
        feedEmpty.classList.add('hidden');
    }
}

function showAllFeedCards() {
    document.querySelectorAll('.feed-card').forEach(function(card) {
        card.style.display = '';
        card.style.animation = 'feedFadeIn 0.4s ease';
    });
    feedEmpty.classList.add('hidden');
}

function clearFeedFilters() {
    document.querySelectorAll('.feed-filter').forEach(function(f) { f.classList.remove('active'); });
}

// Feed category filters
document.querySelectorAll('.feed-filter').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.feed-filter').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        searchInput.value = '';
        var filter = this.getAttribute('data-filter');
        if (filter === 'all') {
            showAllFeedCards();
        } else {
            var found = 0;
            document.querySelectorAll('.feed-card').forEach(function(card) {
                if (card.getAttribute('data-niche') === filter) {
                    card.style.display = '';
                    card.style.animation = 'feedFadeIn 0.4s ease';
                    found++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (found === 0) {
                feedEmpty.classList.remove('hidden');
                feedEmptyQuery.textContent = this.textContent;
            } else {
                feedEmpty.classList.add('hidden');
            }
        }
    });
});

// Like toggle
function toggleLike(btn) {
    var countEl = btn.querySelector('span');
    var iconEl = btn.querySelector('i');
    var count = parseInt(countEl.textContent);
    if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        iconEl.className = 'far fa-heart';
        countEl.textContent = count - 1;
    } else {
        btn.classList.add('liked');
        iconEl.className = 'fas fa-heart';
        countEl.textContent = count + 1;
        btn.style.transform = 'scale(1.2)';
        setTimeout(function() { btn.style.transform = ''; }, 200);
    }
}

// Stats animation
function animateStats() {
    document.querySelectorAll('.hs-num').forEach(function(el) {
        var target = parseInt(el.getAttribute('data-target'));
        var duration = 2000;
        var start = performance.now();
        function update(now) {
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// Notifications
function showNotif(text, type) {
    var container = document.getElementById('notifContainer');
    var icons = { success: 'fas fa-check-circle', info: 'fas fa-info-circle' };
    var el = document.createElement('div');
    el.className = 'notif ' + type;
    el.innerHTML = '<i class="' + icons[type] + '"></i><span>' + text + '</span>';
    container.appendChild(el);
    setTimeout(function() {
        el.style.opacity = '0';
        el.style.transform = 'translateX(100%)';
        el.style.transition = '0.3s';
        setTimeout(function() { el.remove(); }, 300);
    }, 4000);
}

function randomNotif() {
    var msgs = [
        ['Novo lead: Fernanda Almeida via Instagram', 'success'],
        ['Campanha aprovada em 8 minutos!', 'info'],
        ['Lead convertido: Bruno Ferreira - WhatsApp', 'success'],
        ['Custo do lead caiu 15% esta semana', 'success'],
        ['Nova campanha em modo aprendizado', 'info'],
        ['+5 leads novos para Clínica Renova', 'success'],
        ['Campanha E-Shop Brasil otimizada', 'info'],
    ];
    var pick = msgs[Math.floor(Math.random() * msgs.length)];
    showNotif(pick[0], pick[1]);
}

// Scroll animation
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step, .result-card, .feed-card').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Inject keyframe for feed fade in
var style = document.createElement('style');
style.textContent = '@keyframes feedFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(style);

// Init
window.addEventListener('load', function() {
    animateStats();
});

// Bottom nav active state on scroll
var bniLinks = document.querySelectorAll('.bni[href^="#"]');
if (bniLinks.length) {
    var sectionIds = [];
    bniLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) sectionIds.push(href.substring(1));
    });
    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY + 120;
        var current = sectionIds[0];
        for (var i = 0; i < sectionIds.length; i++) {
            var el = document.getElementById(sectionIds[i]);
            if (el && el.offsetTop <= scrollY) current = sectionIds[i];
        }
        bniLinks.forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }, { passive: true });
}

// ==========================================
// LANDING PAGE JS - IAXO Ads (Firestore feed + static fallback)
// ==========================================

var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');
var feedGrid = document.getElementById('feedGrid');
var feedEmpty = document.getElementById('feedEmpty');
var feedEmptyQuery = document.getElementById('feedEmptyQuery');

// ==========================================
// FEED - Load from Firestore with fallback
// ==========================================
function loadFeedPosts() {
    if (typeof db === 'undefined') return; // static cards are already in HTML

    try {
        db.collection('feed_posts').orderBy('createdAt', 'desc').limit(20).get()
            .then(function(snap) {
                if (snap.empty) return; // keep static cards
                // Clear static cards
                feedGrid.innerHTML = '';
                snap.forEach(function(doc) {
                    var p = doc.data();
                    var card = createFeedCard(p);
                    feedGrid.appendChild(card);
                });
                // Re-observe for animations
                observeFeedCards();
            })
            .catch(function() {
                // Static cards remain
            });
    } catch(e) {
        // Static cards remain
    }
}

function createFeedCard(p) {
    var card = document.createElement('div');
    card.className = 'feed-card';
    card.setAttribute('data-niche', p.niche || 'all');
    card.setAttribute('data-search', ((p.title || '') + ' ' + (p.niche || '') + ' ' + (p.location || '')).toLowerCase());

    var badgeClass = p.status === 'live' ? 'on' : 'learning';
    var badgeText = p.status === 'live' ? 'No Ar' : 'Aprendizado';
    var badgeIcon = p.status === 'live' ? 'fa-circle' : 'fa-graduation-cap';

    var gradient = p.gradient || 'linear-gradient(135deg, #2D1810, #FF6B2C)';
    var initials = (p.initials || 'AD').toUpperCase();
    var avatarGrad = p.avatarGradient || 'linear-gradient(135deg, #FF6B2C, #FFB347)';

    var waText = encodeURIComponent('Olá! Vi o anúncio e gostaria de mais informações.');
    var waLink = p.whatsapp ? 'https://wa.me/' + p.whatsapp.replace(/\D/g, '') + '?text=' + waText : '#';

    card.innerHTML =
        '<div class="feed-card-img" style="background:' + gradient + '">' +
            '<div class="feed-card-badge ' + badgeClass + '"><i class="fas ' + badgeIcon + '"></i> ' + badgeText + '</div>' +
            '<div class="feed-card-icon"><i class="fas ' + (p.icon || 'fa-bullhorn') + '"></i></div>' +
            '<div class="feed-card-format">1080x1350</div>' +
        '</div>' +
        '<div class="feed-card-body">' +
            '<div class="feed-card-user">' +
                '<div class="feed-avatar" style="background:' + avatarGrad + '">' + initials + '</div>' +
                '<div><strong>' + escapeHtml(p.title || 'Campanha') + '</strong><span class="feed-nome">' + escapeHtml(p.location || '') + '</span></div>' +
            '</div>' +
            '<p class="feed-card-copy">' + escapeHtml(p.copy || '') + '</p>' +
            '<div class="feed-card-stats">' +
                '<div class="fcs"><i class="fas fa-users"></i> <strong>' + (p.leads || 0) + '</strong> leads</div>' +
                '<div class="fcs"><i class="fas fa-coins"></i> <strong>R$ ' + (p.costPerLead || '0,00') + '</strong>/lead</div>' +
                '<div class="fcs"><i class="fas fa-clock"></i> <strong>' + (p.days || 0) + '</strong> dias</div>' +
            '</div>' +
            '<div class="feed-card-actions">' +
                '<a href="' + waLink + '" target="_blank" class="feed-wa"><i class="fab fa-whatsapp"></i> Falar Agora</a>' +
                '<button class="feed-like" onclick="toggleLike(this)"><i class="far fa-heart"></i> <span>' + (p.likes || Math.floor(Math.random() * 300) + 50) + '</span></button>' +
            '</div>' +
        '</div>';

    return card;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ==========================================
// SEARCH & FILTER
// ==========================================
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

    var found = 0;
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

// ==========================================
// LIKE TOGGLE
// ==========================================
function toggleLike(btn) {
    var countEl = btn.querySelector('span');
    var iconEl = btn.querySelector('i');
    var count = parseInt(countEl.textContent) || 0;
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

// ==========================================
// STATS ANIMATION
// ==========================================
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

// ==========================================
// SCROLL ANIMATION (Observer)
// ==========================================
function observeFeedCards() {
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
}

// Inject keyframe for feed fade in
var style = document.createElement('style');
style.textContent = '@keyframes feedFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(style);

// ==========================================
// BOTTOM NAV ACTIVE STATE ON SCROLL
// ==========================================
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

// ==========================================
// INIT
// ==========================================
window.addEventListener('load', function() {
    animateStats();
    observeFeedCards();
    loadFeedPosts();
});

// ==========================================
// FIREBASE SERVICES - IAXO Feed
// Auth + Firestore + Storage helpers
// ==========================================

var FB = {
    // Auth: create user
    createUser: function(email, password, displayName) {
        return auth.createUserWithEmailAndPassword(email, password)
            .then(function(cred) {
                return cred.user.updateProfile({ displayName: displayName }).then(function() {
                    return db.collection('users').doc(cred.user.uid).set({
                        uid: cred.user.uid,
                        name: displayName,
                        email: email,
                        role: 'user',
                        business: '',
                        niche: '',
                        phone: '',
                        whatsapp: '',
                        status: 'pending',
                        plan: 'premium',
                        leads: 0,
                        campaigns: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() { return cred.user; });
                });
            });
    },

    // Auth: sign in
    signIn: function(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
            .then(function(cred) {
                return db.collection('users').doc(cred.user.uid).get().then(function(doc) {
                    var userData = doc.exists ? doc.data() : { role: 'user' };
                    var userObj = {
                        uid: cred.user.uid,
                        name: userData.name || cred.user.displayName || email,
                        email: email,
                        role: userData.role || 'user',
                        business: userData.business || '',
                        niche: userData.niche || ''
                    };
                    localStorage.setItem('iaxo_user', JSON.stringify(userObj));
                    return userObj;
                });
            });
    },

    // Auth: sign out
    signOut: function() {
        localStorage.removeItem('iaxo_user');
        return auth.signOut();
    },

    // Auth: create admin (seed)
    createAdmin: function(email, password) {
        return auth.createUserWithEmailAndPassword(email, password)
            .then(function(cred) {
                return cred.user.updateProfile({ displayName: 'Admin IAXO' }).then(function() {
                    return db.collection('users').doc(cred.user.uid).set({
                        uid: cred.user.uid,
                        name: 'Admin IAXO',
                        email: email,
                        role: 'admin',
                        business: 'IAXO Feed',
                        niche: 'Tecnologia',
                        status: 'active',
                        plan: 'admin',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() { return cred.user; });
                });
            });
    },

    // Firestore: add document
    addDoc: function(collection, data) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection(collection).add(data);
    },

    // Firestore: update document
    updateDoc: function(collection, docId, data) {
        return db.collection(collection).doc(docId).update(data);
    },

    // Firestore: delete document
    deleteDoc: function(collection, docId) {
        return db.collection(collection).doc(docId).delete();
    },

    // Firestore: get all docs
    getDocs: function(collection) {
        return db.collection(collection).get().then(function(snap) {
            var docs = [];
            snap.forEach(function(doc) { docs.push({ id: doc.id, ...doc.data() }); });
            return docs;
        });
    },

    // Firestore: get docs where
    getDocsWhere: function(collection, field, op, value) {
        return db.collection(collection).where(field, op, value).get().then(function(snap) {
            var docs = [];
            snap.forEach(function(doc) { docs.push({ id: doc.id, ...doc.data() }); });
            return docs;
        });
    },

    // Firestore: listen real-time
    onSnapshot: function(collection, callback) {
        return db.collection(collection).orderBy('createdAt', 'desc').onSnapshot(function(snap) {
            var docs = [];
            snap.forEach(function(doc) { docs.push({ id: doc.id, ...doc.data() }); });
            callback(docs);
        });
    },

    // Storage: upload file
    uploadFile: function(path, file) {
        var ref = storage.ref(path);
        return ref.put(file).then(function() {
            return ref.getDownloadURL();
        });
    }
};

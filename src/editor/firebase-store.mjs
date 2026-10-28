import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getFirestore, getDocFromServer, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { sha256, encodeCloudDocument, decodeCloudDocument, assertCurrentDocument, DocumentAccessDenied } from './cloud-document.mjs';

export async function createFirebaseStore(config, seed, base = '') {
  const app = getApps().find((candidate) => candidate.name === 'implementation-editor') || initializeApp(config, 'implementation-editor');
  const auth = getAuth(app);
  auth.languageCode = 'ru';
  const database = getFirestore(app);
  const reference = doc(database, 'implementationDocuments', await sha256(seed.storageId || seed.documentId));
  const accessListeners = new Set();
  await auth.authStateReady();
  // Every visitor receives a session automatically. No email, password, popup,
  // provider selection or editor membership is required.
  if (!auth.currentUser) await signInAnonymously(auth);
  let access = { uid: auth.currentUser.uid, canEdit: true };
  onAuthStateChanged(auth, (user) => {
    access = { uid: user?.uid || '', canEdit: !!user };
    accessListeners.forEach((listener) => listener(access));
  });

  return {
    kind: 'firebase',
    get access() { return access; },
    onAccess(listener) { accessListeners.add(listener); return () => accessListeners.delete(listener); },
    async load() {
      const current = await getDocFromServer(reference);
      return current.exists() ? decodeCloudDocument(current.data(), seed, base) : seed;
    },
    watch(listener, onError) {
      let latest = 0;
      return onSnapshot(reference, (snapshot) => {
        if (snapshot.metadata.hasPendingWrites || snapshot.metadata.fromCache) return;
        const ticket = ++latest;
        void (snapshot.exists() ? decodeCloudDocument(snapshot.data(), seed, base) : Promise.resolve(seed))
          .then((value) => { if (ticket === latest) listener(value); }, onError);
      }, onError);
    },
    async save(document, expectedEtag, sourceSha256) {
      const user = auth.currentUser;
      if (!access.canEdit || !user) throw new DocumentAccessDenied('permission-denied');
      const encoded = await encodeCloudDocument(document, base);
      await runTransaction(database, async (transaction) => {
        const current = await transaction.get(reference);
        assertCurrentDocument(current.exists() ? current.data() : null, expectedEtag, seed);
        if (auth.currentUser?.uid !== user.uid || !access.canEdit) throw new DocumentAccessDenied('permission-denied');
        transaction.set(reference, { format: 1, documentId: seed.documentId, title: seed.title,
          ...encoded, sourceSha256, updatedAt: serverTimestamp(), updatedBy: user.uid });
      });
      return { etag: encoded.etag, sourceSha256 };
    },
  };
}

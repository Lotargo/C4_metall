import { DocumentChanged } from './document-store.mjs';
import { createImplementationStores } from './implementation-store.mjs';
import { readDocumentRequest, DocumentTooLarge } from './editor-request.mjs';

// Development only. There is no write endpoint in the published static site.
export default function implementationEditorPlugin() {
  return {
    name: 'implementation-editor',
    configureServer(server) {
      const base = server.config.base.replace(/\/$/, '');
      const implementationStore = createImplementationStores(server.config.root, { base });
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname;
        const main = pathname === `${base}/api/implementation/document` || pathname === '/api/implementation/document';
        if (!main) return next();
        const send = (status, value) => {
          res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
          res.end(JSON.stringify(value));
        };
        try {
          const selectedStore = await implementationStore(url.searchParams.get('id'));
          if (!selectedStore) return send(404, { error: 'Документ не найден' });
          if (req.method === 'GET') return send(200, await selectedStore.load());
          if (req.method !== 'PUT') return send(405, { error: 'Метод не поддерживается' });
          if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return send(403, { error: 'Другой источник запроса' });
          if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'Требуется JSON' });
          const { document, baseEtag } = await readDocumentRequest(req);
          if (!/^[a-f0-9]{64}$/.test(baseEtag || '') || document?.type !== 'doc') return send(400, { error: 'Неверный документ или контрольная сумма' });
          const saved = await selectedStore.save(document, baseEtag);
          return send(200, { etag: saved.etag, savedAt: saved.savedAt });
        } catch (error) {
          if (error instanceof DocumentTooLarge) return send(413, { error: error.message });
          return send(error instanceof DocumentChanged ? 409 : 400, { error: error instanceof DocumentChanged ? error.message : 'Не удалось сохранить или прочитать копию документа' });
        }
      });
    },
  };
}

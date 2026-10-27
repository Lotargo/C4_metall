export class DocumentTooLarge extends Error {}

export async function readDocumentRequest(request, limit = 2_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new DocumentTooLarge('Документ слишком большой');
    chunks.push(buffer);
  }
  // Decode once: an individual network chunk can end halfway through a UTF-8 character.
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Compare actual durable file bytes, rather than only projected tool responses.
export async function storageSnapshot(root) {
  const files = {};
  async function scan(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; })) {
      const relative = directory ? `${directory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await scan(relative);
      else if (entry.isFile() && entry.name.endsWith('.json')) files[relative] = await readFile(join(root, relative), 'utf8');
    }
  }
  files['library.json'] = await readFile(join(root, 'library.json'), 'utf8');
  files['runtime/bindings.json'] = await readFile(join(root, 'runtime/bindings.json'), 'utf8');
  await scan('novels'); await scan('runtime/requests');
  return JSON.stringify(Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b))));
}

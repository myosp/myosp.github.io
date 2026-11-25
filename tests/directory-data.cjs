const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const csv = 'Nama dan gelar,NIP,Email\nNama,199812172025211016,nama@example.com';
function setup(fetch, options = {}) {
  const storage = new Map();
  const context = vm.createContext({ fetch, AbortController, setTimeout: options.setTimeout || setTimeout, clearTimeout,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => { if(options.storageBlocked) throw Error(); storage.set(key,value); } } });
  vm.runInContext(fs.readFileSync('directory-csv.js','utf8') + '\n' + fs.readFileSync('directory-data.js','utf8'), context);
  return {context, storage, load: callback => context.loadDirectoryData('plp', undefined, callback)};
}
const response = (body = csv) => ({ok:true, text: async () => body});
test('first failed request retries automatically and saves validated data', async () => {
  let calls=0; const app=setup(async()=>{if(++calls===1) throw Error('network'); return response();});
  assert.equal((await app.load())[0].nip,'199812172025211016'); assert.equal(calls,2); assert.equal(app.storage.size,1);
});
test('slow request times out and retries', async () => {
  let calls=0;
  const app=setup(async(_, {signal})=>{if(++calls>1)return response();return new Promise((_, reject)=>signal.addEventListener('abort',()=>reject(Error('timeout'))));}, {setTimeout: fn=>setTimeout(fn,5)});
  assert.equal((await app.load()).length,1);assert.equal(calls,2);
});
test('cached data returns without waiting and receives a background update', async () => {
  let resolve;let calls=0;const app=setup(async()=>++calls===1?response():new Promise(r=>resolve=r));
  await app.load();let update;const cached=await app.load(data=>update=data);
  assert.equal(cached[0].name,'Nama');assert.equal(update,undefined);
  resolve(response(csv.replace('Nama,','Baru,')));await new Promise(r=>setTimeout(r,0));assert.equal(update[0].name,'Baru');
});
test('network failure or invalid CSV cannot overwrite a good cache', async () => {
  let calls=0;const app=setup(async()=>++calls===1?response():response('<html>Sign in</html>'));
  await app.load();const before=[...app.storage.values()][0];assert.equal((await app.load())[0].name,'Nama');
  await new Promise(r=>setTimeout(r,0));assert.equal([...app.storage.values()][0],before);assert.equal(calls,3);
});
test('blocked storage does not prevent loading', async () => {
  const app=setup(async()=>response(),{storageBlocked:true});assert.equal((await app.load()).length,1);
});

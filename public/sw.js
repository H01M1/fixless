// public/sw.js
// ---------------------------------------------
// Kill switch Service Worker
// 古いSWを削除して自分自身も消える自爆SW
// ---------------------------------------------

self.addEventListener('install', () => {
  // 待機せず即座に新SWを有効化
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. 全キャッシュを削除
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // 2. 全タブの制御を奪う
      await self.clients.claim();

      // 3. 自分自身を登録解除
      const registration = await self.registration;
      await registration.unregister();

      // 4. 開いている全タブを再読込
      const clientList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientList) {
        client.navigate(client.url);
      }
    })()
  );
});

// fetchイベントでは何もしない（ネットワークから直接取得させる）
self.addEventListener('fetch', () => {});
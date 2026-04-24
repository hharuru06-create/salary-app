const CACHE_NAME = "salary-app-v3";

// キャッシュするファイル一覧
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json"
];

/**
 * インストール時：キャッシュ作成＆ファイル保存
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

/**
 * アクティベート時：古いSWをすぐ制御対象にする
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * フェッチ処理：
 * ① キャッシュがあればそれを返す
 * ② なければネットワーク
 * ③ ネットもダメならindex.html（オフライン用）
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        return caches.match("./index.html");
      });
    })
  );
});
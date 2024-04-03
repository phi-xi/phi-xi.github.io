# pwa | Progressive Web Application API
## General
pwa.js provides an API for handling service worker of a PWA.
The service worker handles offline mode with a cache fallback. A requested resource is served from remote if network available, otherwise from cache. When a resource has been fetched, it is updated in the cache automatically. The service worker itself can be updated (for clients) by changing the value of 'serviceWorker' in version.json.

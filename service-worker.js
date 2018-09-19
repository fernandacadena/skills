var cacheName 	  = 'MySkills_v1';
var dataCacheName = 'MySkills-data-v1';
var filesToCache  = [ '/',
					  '/index.html',
					  '/scripts/app.js',
					  '/scripts/firebase-app-5.4.0.min.js',
					  '/scripts/firebase-auth-5.4.0.min.js',
					  '/scripts/firebase-database-5.4.0.min.js',
					  '/scripts/materialize-1.0.0.min.js',
					  '/styles/materialize-1.0.0.min.css',
					  '/images/logo_32x32.png',
					  '/images/logo_128x128.png',
					  '/images/logo_144x144.png',
					  '/images/logo_152x152.png',
					  '/images/logo_192x192.png',
					  '/images/logo_256x256.png',
					  '/images/ic_android.png',
					  '/images/ic_ionic.png',
					  '/images/ic_ios.png',
					  '/images/ic_react.png'
					];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var dataUrl = 'https://myskills-877a3.firebaseapp.com';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
     caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});


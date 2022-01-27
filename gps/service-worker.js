/*
Copyright 2015, 2019, 2020, 2021 Google LLC. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'offline';
// Customize this with a different URL if needed.
const OFFLINE_URL = 'gps02.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.

    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
	await cache.add(new Request("newtask.wav", {cache: 'reload'}));
	cache.add('/gps');
	//cache.add('/voice/新任務.wav');
		cache.add('/voice/去程.wav');
		cache.add('/voice/回程.wav');
		cache.add('/voice/跳過.wav');
		
		cache.add('/voice/通過.wav');
		cache.add('/voice/坑洞.wav');
		cache.add('/voice/急彎.wav');
		cache.add('/voice/號誌.wav');
  })());
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});
/*
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener_XX('fetch', (event) => {	//只把名字加XX會報錯
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // First, try to use the navigation preload response if it's supported.
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        // Always try the network first.
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // catch is only triggered if an exception is thrown, which is likely
        // due to a network error.
        // If fetch() returns a valid HTTP response with a response code in
        // the 4xx or 5xx range, the catch() will NOT be called.
		console.log('Fetch failed; returning offline page instead.', error);

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
	}
	}))
	}
  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
});
*/
/*
//from https://ithelp.ithome.com.tw/articles/10220322
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) {
                return response;
            } else {
                return fetch(event.request).then(function(res) {
                    return caches.open('dynamic').then(function(cache) {
						console.log(event.request.url + ", " + res);	
						//duck : https://w3c.github.io/ServiceWorker/#cache-put 第6點表示不可以cache 某些類型,如非文字檔
                        cache.put(event.request.url, res.clone());
                        return res;
                    })
                }).catch(function(err) {
                    
                });
            }
        })
    );
});
*/
//來源：https://ithelp.ithome.com.tw/articles/10193531
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request)
            .then(function(response){
                //抓不到會拿到 null
				
                if(response){
					console.log("response=" +response);
                    return response;
                }else{
					console.log("event.request=" +event.request.url);
                    return fetch(event.request);
                }
            })
    )
});



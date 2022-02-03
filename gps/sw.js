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
const voideCache = ["",];
const voiceList = [
	"新任務","去程","回程","跳過","全圖","置中","通過",
	"坑洞","急彎","號誌","交流道","廁所"];
function install_Listener(){}
self.addEventListener('install', (event) => {
	//註冊時執行一次, 或內容更新(且舊版未控制資源), 或DevTools勾選「重新載入時更新」
  event.waitUntil((async () => {
    const cache = await caches.open("gps");
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
	// 翻譯：該參數可確保當cache找不到時, 會從網路下載
    //await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
	for(i=0;i<voiceList.length;i++){
		voiceList[i]= "../voice/" + voiceList[i] + ".wav";
		console.log(voiceList[i]);
	}
	cache.addAll(voiceList);
	/*
	//cache.add('.');
//cache.add('index.html');

		
	cache.add('../voice/新任務.wav');
	cache.add('../voice/去程.wav');
	cache.add('../voice/回程.wav');
	cache.add('../voice/跳過.wav');
	
	
	cache.add('../voice/通過.wav');
	cache.add('../voice/坑洞.wav');
	cache.add('../voice/急彎.wav');
	cache.add('../voice/號誌.wav');
	
	cache.add('../voice/交流道.wav');
	cache.add('../voice/廁所.wav');
	// 測試用
	// cache.add('../voice/newtask.wav');
	
	// cache.add('duck.jpg');
	// cache.add('通過.wav');
		*/
  })());
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
  showMsg();
}));
)}

/*
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
/*
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request).then(	//先到cache找
			function(response){
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
*/
// https://ithelp.ithome.com.tw/articles/10220415
/*
self.addEventListener('fetch', function(event) {
	console.log("需要"+ event.request.url);
    event.respondWith(
        fetch(event.request).then(function(res) {
			console.log("fetch成功。");
            return caches.open(CACHE_DYNAMIC_NAME).then(function(cache) {
                cache.put(event.request.url, res.clone());
                return res;
            })
        }).catch(function(err) {		
			console.log("去cache找。");
            return caches.match(event.request)
        })
    );
});
*/


function fetch_Listener(){}
self.addEventListener('fetch', function(event) {
// console.log("需要" + event.request.url);
if (event.request.headers.get('range')) {		//若是要求的資源有range參數。用來判斷為影音檔。
	//https://googlechrome.github.io/samples/service-worker/prefetch-video/index.html
    var pos =
    Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
    // console.log('Range request for', event.request.url,       ', starting position:', pos);
	event.respondWith(
		caches.open("gps")		//cache查找範圍為"gps"
			.then(function(cache) {
				return cache.match(event.request.url);	//找到資源
			})
			.then(function(res) {
				if (!res) {
					return fetch(event.request)
						.then(res => {
							return res.arrayBuffer();
						});
				}
				console.log("SW：從cache取得" + event.request.url);
				return res.arrayBuffer();
			})
			.then(function(ab) {
				return new Response(
					ab.slice(pos),
					{
					status: 206,
					statusText: 'Partial Content',
					headers: [
					// ['Content-Type', 'video/webm'],
					['Content-Range', 'bytes ' + pos + '-' +
					(ab.byteLength - 1) + '/' + ab.byteLength]]
					});
					})
	  );
  } else {
// https://stackoverflow.com/questions/57905153,
//在async函數內部，最好使用await而不是.then()鏈來構建基於 Promise 的邏輯。
event.respondWith((async () => {

  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) {
	  console.log("SW：從cache取得" + event.request.url);
    return cachedResponse;
  }
  
  const response = await fetch(event.request);
  if (!response || response.status !== 200 || response.type !== 'basic') {
	  // console.log("來自網路");
    return response;
  }
  
  if (false) {//TODO 視需求, 每次更新?
		const responseToCache = response.clone();
		const cache = await caches.open("gps");
		await cache.put(event.request, response.clone());
	}

  return response;
})());//end if respondWith
} //end of if...get range
});//end of 'fetch'

function showMsg(){
	self.clients.matchAll().then(function(clients) {
  console.log(clients);
  clients.forEach(function(client) {
    console.log(client);
    if (client.url.includes('/gps/index.html')) {
      // 首页
      client.postMessage('hello world' + client.id);
    }
  });
});
}
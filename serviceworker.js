

let SERVICE_WORKER = {
    version: "",
    cacheName: "PhiXi",
    lastNotification: "",
    messageFile: "/msg.txt",
    versionFile: "/version.json"
};
( async ()=>{
    const res = await fetch( SERVICE_WORKER.versionFile );
    const txt = await res.text();
    const data = JSON.parse( txt );
    SERVICE_WORKER.version = data.serviceWorker;
} )();


function respond( client, topic, text ){
    client.postMessage( {
        topic: topic,
        text: text
    } );
}
function startPullDaemon(){
    setInterval( ()=>{
        ( async()=>{
            const res = await fetch( SERVICE_WORKER.messageFile );
            if ( res.ok ){
                const txt = await res.text(),
                    clients = await self.clients.matchAll();
                if ( SERVICE_WORKER.lastNotification != txt ){
                    SERVICE_WORKER.lastNotification = txt;
                    respond( clients[0], "message", txt );
                }
            }
        } )();
    }, 10000 );
}


self.addEventListener( "install", (e) => {
    console.log( "[Service Worker] Installed" );
    e.waitUntil(
        ( async () => {
            const cache = await caches.open( SERVICE_WORKER.cacheName );
            await cache.addAll( [
                "/error-404.html"
                /*"/index.html",
                "/page-1.html",
                "/script/UserInterface.js",
                "/style/layout.css",
                "/style/style.css",
                "/style/style-content.css"*/
            ] );
        } )()
    );
} );


self.addEventListener( "activate", (e) => {
    console.log( "[Service Worker] Activated" );
    self.clients.matchAll().then( (clients) => {
        clients.forEach( client => respond( client, "lifecycle", "First run" ) );
    } );
} );


self.addEventListener( "fetch", (e) => {
    e.respondWith(
        ( async ()=>{
            const cache = await caches.open( SERVICE_WORKER.cacheName );
            try {
                const rnd = "?" + Math.random().toString().slice(2);
                let url = e.request.url;
                if ( url.indexOf( "http://fonts.googleapis.com" ) != 0
                        && url.indexOf( "https://fonts.googleapis.com" ) != 0
                        && url.indexOf( "https://fonts.gstatic.com/s/ubuntu" ) != 0 ) url += rnd;
                const response = await fetch( url );
                if ( response.ok ){
                    cache.put( e.request, response.clone() );
                    //console.log( "[Service Worker] Serving from remote, updating cache", e.request );
                    return response;
                } else {
                    throw new Error( "Failed to fetch resource" );
                }
            } catch(error){
                //console.log( "[Service Worker] Serving from cache", e.request );
                const r = await caches.match( e.request );
                if ( r ){
                    return r;
                } else {
                    //console.log( "[Service Worker] Serving from cache failed, try serving error page" );
                    const fallback = await caches.match( "/error-404.html" );
                    return fallback;
                }
            }

        } )(),
    );
} );


self.addEventListener( "message", (e) => {
    const msg = e.data,
        src = e.source;
    ( async () => {
        if ( msg == "version" ){
            respond( src, "version", SERVICE_WORKER.version );
        }
        if ( msg == "cache-clear" ){
            const r = await caches.delete( SERVICE_WORKER.cacheName );
            respond( src, "cache", "Cache deleted" );
        }
        if ( msg == "cache-update" ){
            const cache = await caches.open( SERVICE_WORKER.cacheName );
            const keys = await cache.keys();
            for ( let i=0; i < keys.length; i++ ){
                const request = keys[ i ],
                    url = request.url,
                    response = await fetch( url );
                if ( response.ok ){
                    cache.put( request, response.clone() );
                }
            }
            respond( src, "cache", "Cache updated" );
        }
    } )();
} );

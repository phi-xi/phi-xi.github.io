
/*#########################################################################

            s e r v i c e w o r k e r . j s


        Service worker for PWA

        (c) PhiXi, mmXXiv

        <DESCRIPTION>

#########################################################################*/



let SERVICE_WORKER = {
    version: "",
    cacheName: "PhiXi",
    cacheFilesAppShell: [
        "/error/404.html",  // ATTENTION error page must be first element in array!
        "/pull.json"
    ],
    lastNotification: {
        title: "",
        body: "",
        url: ""
    },
    pullInterval: 15,    // in seconds
    pullDaemon: null,
    pullFile: "/pull.json",
    isVerbose: true
};

try {
    startPullDaemon( SERVICE_WORKER.pullInterval );
} catch(e){}

function log( msg ){
    if ( SERVICE_WORKER.isVerbose ) console.log( "[Service Worker] " + msg );
}
function respond( client, topic, text ){
    client.postMessage( {
        topic: topic,
        text: text
    } );
}
async function pullDaemonTask(){
    const cache = await caches.open( SERVICE_WORKER.cacheName ),
        rnd = "?" + Math.random().toString().slice(2),
        res = await fetch( SERVICE_WORKER.pullFile + rnd ),
        resClone = res.clone();
    let txt = null;
    if ( res.ok ){
        txt = await res.text();
        const clients = await self.clients.matchAll();
        cache.put( SERVICE_WORKER.pullFile, resClone );
    } else {
        txt = await cache.match( SERVICE_WORKER.pullFile );
        log( "startPullDaemon(): Try loading from cache", txt );
    }
    const pullData = JSON.parse( txt ),
        notification = pullData.notification,
        cmd = pullData.command,
        info = pullData.info,
        swVersion = info.version.serviceWorker;
    if ( SERVICE_WORKER.lastNotification.title != notification.title ){
        SERVICE_WORKER.lastNotification.title = notification.title;
        if ( pullData.notification.title != "" ){
            self.clients.matchAll().then( (clients) => {
                clients.forEach( client => respond( client, "message", txt ) );
            } );
        }
    }
    if ( SERVICE_WORKER.version != swVersion ){
        SERVICE_WORKER.version = swVersion;
        self.clients.matchAll().then( (clients) => {
            clients.forEach( client => respond( client, "update", "" ) );
        } );
    }
    if ( cmd != "" ){
        //TODO
    }
}
function startPullDaemon( refreshInterval ){
    if ( SERVICE_WORKER.pullDaemon === null ){
        pullDaemonTask();
        SERVICE_WORKER.pullDaemon = setInterval( pullDaemonTask, 1000 * refreshInterval );
    }
}

self.addEventListener( "install", (e) => {
    log( "Installed" );
    e.waitUntil(
        ( async () => {
            const cache = await caches.open( SERVICE_WORKER.cacheName );
            await cache.addAll( SERVICE_WORKER.cacheFilesAppShell );
        } )()
    );
} );

self.addEventListener( "activate", (e) => {
    log( "Activated" );
    self.clients.matchAll().then( (clients) => {
        clients.forEach( client => respond( client, "lifecycle", "First run" ) );
    } );
    startPullDaemon( SERVICE_WORKER.pullInterval );
} );

self.addEventListener( "fetch", (e) => {
    e.respondWith(
        ( async ()=>{
            const cache = await caches.open( SERVICE_WORKER.cacheName );
            try {
                const rnd = "?" + Math.random().toString().slice(2);
                let url = e.request.url;
                const response = await fetch( url );
                if ( response.ok ){
                    let p = await cache.put( e.request, response.clone() );
                    log( "Serving from remote, updating cache", e.request.url );
                    return response;
                } else {
                    throw new Error( "Failed to fetch resource" );
                }
            } catch(error){
                log( "Serving from cache", e.request.url );
                const r = await caches.match( e.request );
                if ( r ){
                    return r;
                } else {
                    log( "Serving from cache failed, try serving error page" );
                    const fallback = await caches.match( SERVICE_WORKER.cacheFilesAppShell[0] );
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
            const cache = await caches.open( SERVICE_WORKER.cacheName ),
                keys = await cache.keys();
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

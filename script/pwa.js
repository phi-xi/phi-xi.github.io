/*#########################################################################

        Progressive web application interface

        (c) PhiXi, mmXXiv

    Provides an interface for a progressive web application.
    Service worker serves resources always from network, if available,
    otherwise from cache. Whenever a cached resource has been fetched
    from network, it will be updated in the cache.
    Any change in the version file triggers service worker update.
    The cache is updated (=all cached resources are fetched again) when
    the service worker receives the message 'cache-update'; note that
    your application must implement this.
    The cache is deleted when the service worker receives the message
    'cache-clear'; note that your application must implement this.

#########################################################################*/


const PWA = ( function(){

    const notificationIconURL = "/img/icons-pwa/icon-144.png",
        serviceWorkerFile = "/serviceworker.js",
        versionFile = "/version.json";

    let serviceWorkerVersion = "";

    async function getLatestVersion(){
        const res = await fetch( versionFile + "?" + Math.random().toString().slice(2) );
        if ( res.ok ){
            const txt = await res.text();
            try {
                const data = JSON.parse( txt );
                return data.serviceWorker;
            } catch(e){}
        }
        return false;
    }

    ( async ()=>{
        serviceWorkerVersion = await getLatestVersion();
    } )();

    return {
        isStandalone: ()=>{
            return window.matchMedia( "(display-mode: standalone)" ).matches;
        },
        log: (msg)=>{
            console.log( "[PWA] " + msg );
        },
        requestPermissionNotify: ()=>{
            Notification.requestPermission().then( (result)=>{
                if ( result === "granted" ) PWA.log( "Notifications permission granted" );
            } );
        },
        serviceWorker: {
            file: serviceWorkerFile,
            getLatestVersion: ()=>{
                return serviceWorkerVersion;
            },
            register: ()=>{
                if ( "serviceWorker" in navigator ){
                    navigator.serviceWorker.register( PWA.serviceWorker.file, {
                        scope: "/"
                    } );
                    navigator.serviceWorker.addEventListener( "message", (event)=>{
                        const msg = event.data,
                            serviceWorkerVersion = PWA.serviceWorker.getLatestVersion();
                        if ( msg.topic == "version" && serviceWorkerVersion != "" ){
                            const ver = msg.text;
                            if ( ver != serviceWorkerVersion ){
                                PWA.log( "Update available" );
                                //navigator.serviceWorker.controller.postMessage( "cache-clear" );
                                PWA.serviceWorker.unregister();
                                setTimeout( ()=>{
                                    window.location.href = "/";
                                }, 3000 );
                            }
                        }
                        if ( msg.topic == "cache" ){
                            PWA.log( msg.text );
                        }
                        if ( msg.topic == "lifecycle" ){
                            PWA.log( msg.text );
                        }
                        if ( msg.topic == "message" ){
                            const data = JSON.parse( msg.text );
                            let cb = (e)=>{},
                                config = {
                                body: data.body,
                                icon: notificationIconURL
                            };
                            if ( data.url != "" ) cb = (e)=>{
                                e.preventDefault();
                                window.open( data.url );
                            };
                            new Notification( data.title, config ).onclick = cb;
                        }
                    } );
                    navigator.serviceWorker.ready.then( (r)=>{
                        setTimeout( ()=>{
                            navigator.serviceWorker.controller.postMessage( "version" );
                        }, 10000 );
                    } );
                } else {
                    PWA.log( "Error: serviceWorker interface not available" );
                }
            },
            unregister: ()=>{
                if ( "serviceWorker" in navigator ){
                    navigator.serviceWorker.getRegistration()
                        .then( ( serviceWorker )=>{
                            if ( serviceWorker ){
                                serviceWorker.unregister();
                            }
                        } )
                        .catch( ( error )=>{
                            PWA.log( "Error: unregistering service worker failed" );
                        } );
                } else {
                    PWA.log( "Error: serviceWorker interface not available" );
                }
            }
        }
    };

} )();

PWA.serviceWorker.register();

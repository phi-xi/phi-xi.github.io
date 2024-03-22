
/*#########################################################################

            p w a . j s


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

    const notificationIconURL = "/img/icon-pwa/icon-144.png",
        serviceWorkerFile = "/serviceworker.js";

    let serviceWorkerVersion = "";

    return {
        isStandalone: ()=>{
            return window.matchMedia( "(display-mode: standalone)" ).matches;
        },
        log: (msg)=>{
            new Toast( "[PWA] " + msg ).letConfirm().show();
        },
        requestPermissionNotify: ()=>{
            Notification.requestPermission().then( (result)=>{
                if ( result === "granted" ) PWA.log( "Notifications permission granted" );
            } );
        },
        serviceWorker: {
            file: serviceWorkerFile,
            register: ( scope="/" )=>{
                if ( "serviceWorker" in navigator ){
                    navigator.serviceWorker.register( PWA.serviceWorker.file, {
                        scope: scope
                    } );
                    navigator.serviceWorker.addEventListener( "message", (event)=>{
                        const msg = event.data,
                            msgTopic = [ "cache", "lifecycle", "version" ];
                        if ( msgTopic.indexOf( msg.topic ) >= 0 ){
                            PWA.log( msg.text );
                        }
                        if ( msg.topic == "update" ){
                            PWA.log( "Service worker update available, unregistering existing and registering new version..." );
                            PWA.serviceWorker.unregister();
                            setTimeout( ()=>{
                                window.location.href = "/";
                            }, 3000 );
                        }
                        if ( msg.topic == "message" ){
                            const data = JSON.parse( msg.text ).notification;
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
            },
            post: ( msg )=>{
                navigator.serviceWorker.controller.postMessage( msg );
            }
        }
    };

} )();

PWA.serviceWorker.register( "/test/mobile/" );

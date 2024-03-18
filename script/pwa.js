/*

        Progressive web application interface

        (c) PhiXi, mmXXiv

*/


const PWA = ( ()=>{

    return {

        serviceWorker: {
            file: "/serviceworker.js",
            getLatestVersion: async ()=>{
                const res = await fetch( "version.json?" + Math.random().toString().slice(2) );
                if ( res.ok ){
                    const txt = await res.text();
                    try {
                        const data = JSON.parse( txt );
                        //this.#serviceWorkerVersion = data.serviceWorker;
                        return data.serviceWorker;
                    } catch(e){}
                }
            },
            register: ()=>{
                if ( "serviceWorker" in navigator ){
                    navigator.serviceWorker.register( PWA.serviceWorker.file, {
                        scope: "/"
                    } );
                    navigator.serviceWorker.addEventListener( "message", async(event)=>{
                        const msg = event.data;
                        if ( msg.topic == "version" ){
                            const ver = msg.text,
                                serviceWorkerVersion = await PWA.serviceWorker.getLatestVersion();
                            if ( serviceWorkerVersion != "" && ver != serviceWorkerVersion ){
                                PWA.log( "Update available" );
                                navigator.serviceWorker.controller.postMessage( "clear_cache" );
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
                            new Notification( "Notification received", {body: msg.text, icon: ""} );
                        }
                    } );
                    navigator.serviceWorker.ready.then( (r)=>{
                        setTimeout( ()=>{
                            navigator.serviceWorker.controller.postMessage( "version" );
                        }, 5000 );
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
        },
        requestPermissionNotify: ()=>{
            Notification.requestPermission().then( (result)=>{
                if ( result === "granted" ) PWA.log( "Notifications permission granted" );
            } );
        },
        isStandalone: ()=>{
            return window.matchMedia( "(display-mode: standalone)" ).matches;
        },
        log: (msg)=>{
            console.log( "[PWA] " + msg );
        }

    };

} )();

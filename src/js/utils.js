const U = ( function(){

    const COLOR_CHANNEL_MAX = 255;

    let state = {
        shader: false,
        toastDiv: false,
        tabScroll: false
    };

    function addPadding( n, padding="0" ){
        while ( n.length < 2 ){
            n = padding + n;
        }
        return n;
    }
    function colorHexToDec( hexColor ){
        if ( hexColor.length > 6 ) hexColor = hexColor.slice(1);
        let r = parseInt( hexColor.slice(0,2), 16 ),
            g = parseInt( hexColor.slice(2,4), 16 ),
            b = parseInt( hexColor.slice(4), 16 );
            return { r: r, g: g, b: b };
    }
    function colorDecToHex( r, g, b ){
        let hexColor = "";
        hexColor += addPadding( r.toString(16) );
        hexColor += addPadding( g.toString(16) );
        hexColor += addPadding( b.toString(16) );
        return hexColor;
    }
    function imgIsLandscapeOriented( imgElement ){
        return ( imgElement.clientWidth > imgElement.clientHeight );
    }
    function __selfDestroy(){
        document.body.removeChild( this );
        delete this;
    }
    function __showOverlayWithImg(){
        let o = getOverlay(),
            c = this.cloneNode( true );
            c.classList.remove( "img" );
            if ( imgIsLandscapeOriented( this ) ){
                c.style.width = "95vw";
            } else {
                c.style.height = "95vh";
            }
            setTimeout( ()=>{
                c.scrollIntoView();
                let correction = ( window.innerHeight - c.clientHeight ) / ( -2 );
                window.scrollBy( 0, correction );
            }, 100 );
            o.appendChild( c );
            document.body.appendChild( o );
            o.style.marginTop = window.scrollY;
            return o;
    }
    function getOverlay(){
        let o = U.mk( "div", "overlay" );
        o.addEventListener( "click", __selfDestroy );
        o.addEventListener( "wheel", __selfDestroy );
        return o;
    }

    const lMgr = setInterval( ()=>{
        if ( U.ui.tab() == void(0) ) return;
        U.ui.tab().makeCollapsible();
        clearInterval( lMgr );
    }, 5 );

    return {

        r: ( n ) => {
            return document.getElementById( n )
            || document.getElementsByClassName( n )
            || document.getElementsByTagName( n );
        },
        mk: ( e="div", cn="" ) => {
            let _e = document.createElement( e );
            _e.className = cn;
            return _e;
        },
        request: ( url, method, headers, body=false ) => {
            return new Promise( async ( resolve, reject ) => {
                try {
                    let result = false,
                    req = {
                        method:     method,
                        headers:    headers
                    };
                    if ( body ){
                        req.body = body;
                    }
                    const response = await fetch( url, req );
                    if ( !response.ok ){
                        throw new Error( `Response status: ${response.status}` );
                    }
                    const response_clone = response.clone();
                    try {
                        result = await response.json();
                    } catch( e ){
                        result = await response_clone.text();
                    }
                    resolve( result );
                } catch ( error ){
                    reject( error.message );
                }
            } );
        },
        ui: {
            client: {
                isMobile: window.navigator.userAgentData.mobile
            },
            state: () => {
                return state;
            },
            form: ( elementOrIdx ) => {
                return {
                    getData: () => {},
            submit: () => {}
                };
            },
            tab: ( n=-1 ) => {
                const
                tabs = U.r( "tab" ),
            tab = ( typeof(n) == "number" ) ? tabs[ n ] : n;
            return {
                collapse: () => {
                    tab.children[0].classList.add( "tab-title-collapsed" );
                    tab.children[1].classList.add( "tab-cnt-collapsed" );
                },
                expand: () => {
                    tab.children[0].classList.remove( "tab-title-collapsed" );
                    tab.children[1].classList.remove( "tab-cnt-collapsed" );
                },
                makeCollapsible: () => {
                    const
                    tabs    = U.r( "tab" ),
            titles  = U.r( "tab-title" ),
            cnts    = U.r( "tab-cnt" );
            function collapseTabsExcept( tabElement ){
                for ( let i=0; i < tabs.length; i++ ){
                    U.ui.tab( i ).collapse();
                }
                U.ui.tab( tabElement ).expand();
            }
            function setWidthOfTab( c ){
                let cc = c.children[1];
                cc.style.width = ( cc.clientWidth - cc.offsetLeft ).toString() + "px";
            }
            function tabScrollStart( e ){
                state.tabScroll = true;
            }
            function tabScrollStop( e ){
                state.tabScroll = false;
            }
            function _tabScrollMove( e ){
                let t  = e.target;
                if ( !t.className.includes( "tab" ) && !t.className.includes( "tab-title" ) ) return;
                let tab = title = cnt = x = null;
                if ( U.ui.client.isMobile ){
                    if ( e.touches == void(0) ) return;
                    tab     = t.parentElement;
                    title   = tab.children[0];
                    cnt     = tab.children[1];
                    x       = e.touches[0].pageX;
                } else {
                    tab     = this.tab;
                    title   = this.title;
                    cnt     = this.cnt;
                    x       = e.pageX;
                }
                if ( !hasOverflow( cnt ) ) return;
                if ( state.tabScroll ){
                    const marginClient = Number( title.style.marginLeft
                    .replace( /[A-Za-z]*/g, "" ) );
                    if ( marginClient < 0 ){
                        setTimeout( ()=>{
                            title.style.marginLeft = "1px";
                        }, 500 );
                        return;
                    }
                    let relX    = x / tab.clientWidth,
                    d       = relX * ( cnt.scrollHeight - cnt.offsetHeight ),
            margin  = relX * window.innerWidth;
            if ( margin > tab.clientWidth - title.clientWidth / 2 ){
                margin = tab.clientWidth - title.clientWidth;
                d = cnt.scrollHeight;
            }
            cnt.scrollTo( 0, d );
            title.style.marginLeft = margin.toString() + "px";
                }
            }
            function hasOverflow( element ){
                return ( element.scrollHeight > element.clientHeight );
            }
            function makeTabsCollapsible(){
                document.body.style.overflowX = "hidden";
                document.body.addEventListener( "touchstart", tabScrollStart, false );
                document.body.addEventListener( "touchmove", _tabScrollMove, false );
                document.body.addEventListener( "touchend", tabScrollStop, false );
                window.addEventListener( "mouseup", tabScrollStop );
                for ( let i=0; i < cnts.length; i++ ){
                    let tab     = tabs[ i ],
                    title   = titles[ i ],
                    cnt     = cnts[ i ],
                    parent  = title.parentElement;
                    title.classList.add( "tab-title-collapsed" );
                    cnt.classList.add( "tab-cnt-collapsed" );
                    cnt.style.overflowY = "hidden";
                    cnt.style.height    = "40vh";
                    cnt.addEventListener( "scroll", function(e){
                        if ( state.tabScroll ) return;
                        let y       = cnt.scrollTop,
                        relY    = y / cnt.scrollHeight,
                        d       = relY * tab.clientWidth + title.clientWidth;
                        title.style.marginLeft = d.toString() + "px";
                    } );
                    title.addEventListener( "click", function(){
                        const isCollapsed = title.classList.contains( "tab-title-collapsed" );
                        collapseTabsExcept( parent );
                        if ( isCollapsed ) setWidthOfTab( parent );
                    } );
                        title.addEventListener( "mousedown", tabScrollStart );
                        const tabScrollMove = _tabScrollMove.bind( {
                            tab:    tab,
                            title:  title,
                            cnt:    cnt,
                            self:   title
                        } );
                        tab.addEventListener( "mousemove", tabScrollMove );
                }
            }
            makeTabsCollapsible();
                }
            };
            },
            dialog: {
                toast: ( msg ) => {
                    if ( !state.toastDiv ){
                        state.toastDiv = U.mk( "div", "toast" );
                        state.shader = U.mk( "div", "shader" );
                        state.shader.style.height = document.body.scrollHeight.toString() + "px";
                        state.toastDiv.innerHTML = msg + "<br><br><button class='btn' style='font-size: 12pt; color: var(--green); border-color: var(--green);'>OK</button>";
                        state.toastDiv.onclick = ()=>{
                            document.body.removeChild( state.toastDiv );
                            document.body.removeChild( state.shader );
                            state.toastDiv = false;
                            state.shader = false;
                        };
                        document.body.appendChild( state.toastDiv );
                        document.body.appendChild( state.shader );
                        state.toastDiv.style.top = ( window.innerHeight / 3 ).toString() + "px";
                    }
                },
                confirm: ( msg, onOk, onCancel ) => {
                    let div = U.mk( "div", "toast" );
                    state.shader = U.mk( "div", "shader" );
                    state.shader.style.height = document.body.scrollHeight.toString() + "px";
                    div.innerHTML = msg + "<br><br><button class='btn' style='font-size: 12pt; color: var(--green); border-color: var(--green);'>OK</button><s-pad></s-pad><button class='btn' style='font-size: 12pt;'>Cancel</button>";
                    div.children[2].onclick = ()=>{
                        onOk();
                        document.body.removeChild( div );
                        document.body.removeChild( state.shader );
                        state.shader = false;
                    };
                    div.children[4].onclick = ()=>{
                        onCancel();
                        document.body.removeChild( div );
                        document.body.removeChild( state.shader );
                        state.shader = false;
                    };
                    document.body.appendChild( state.shader );
                    document.body.appendChild( div );
                    div.style.top = ( window.innerHeight / 3 ).toString() + "px";
                }
            },
            images: {
                makeMaximizable: () => {
                    const images = document.getElementsByTagName( "img" );
                    for ( let i=0; i < images.length; i++ ){
                        let img = images[ i ];
                        img.addEventListener( "click", __showOverlayWithImg.bind( img ) );
                    }
                }
            },
            dropdown: ( elementOrIdx ) => {
                if ( typeof( elementOrIdx ) == "number" ){
                    elementOrIdx = U.r( "select" )[ elementOrIdx ];
                }
                elementOrIdx.innerHTML = "";
                return {
                    setup: ( options, header="" ) => {
                        if ( header != "" ) options = [ header ].concat( options );
                        for ( let i=0; i < options.length; i++ ){
                            let opt = U.mk( "option", "option" );
                            opt.innerHTML = options[ i ];
                            elementOrIdx.appendChild( opt );
                        }
                    }
                };
            }
        },
        color: {
            scale: ( hexColor, factor ) => {
                const col = colorHexToDec( hexColor );
                let r = Math.round( col.r * factor ); if ( r > COLOR_CHANNEL_MAX ) r = COLOR_CHANNEL_MAX;
                let g = Math.round( col.g * factor ); if ( g > COLOR_CHANNEL_MAX ) g = COLOR_CHANNEL_MAX;
                let b = Math.round( col.b * factor ); if ( b > COLOR_CHANNEL_MAX ) b = COLOR_CHANNEL_MAX;
                return colorDecToHex( r, g, b );
            },
            invert: ( hexColor ) => {
                const
                col = colorHexToDec( hexColor ),
            r = COLOR_CHANNEL_MAX - col.r,
            g = COLOR_CHANNEL_MAX - col.g,
            b = COLOR_CHANNEL_MAX - col.b;
            return colorDecToHex( r, g, b );
            },
            hex2dec: ( hexColor ) => {
                colorHexToDec( hexColor );
            },
            dec2hex: ( r, g, b ) => {
                colorDecToHex( r, g, b );
            }
        },
        cookie: {
            get: ( name ) => {
                let p = new URLSearchParams( document.cookie.replace( /\;[\s]*/g, "&" ) );
                return p.get( name );
            },
            set: ( name, value, lifetime=0, path="/" ) => {     //NOTE lifetime in hours
                U.cookie.clear( name, path );
                let age = lifetime.toString();
                if ( lifetime == 0 ) age = "3600";
                document.cookie = name + "="
                    + value
                    + "; Max-Age="
                    + age
                    + "; path="
                    + path;
            },
            clear: ( name, path="/" ) => {
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + path + ";";
            }
        }
    };

} )();

const Q = ( function(){

    const
        version = "1.05";


    function request( url, method, headers, body=false ){
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
    }
    function mk( ename, cname, attr={} ){
        let e = document.createElement( ename );
        if ( cname ){
            e.className = cname;
        }
        for ( let aname in attr ){
            e.setAttribute( aname,
                            attr[ aname ] );
        }
        return e;
    }
    function get_button( name, callback ){
        let b = mk( "button", "q-btn" );
        b.innerHTML = name;
        b.addEventListener( "click", callback );
        return b;
    }
    function get_checkbox( name, callback ){
        let wrap     = mk( "div", "q-checkbox-wrap q-inline" ),
            label    = mk( "label",
                            "q-label q-inline",
                            {
                                for: name
                            } ),
            checkbox = mk( "input",
                            "q-checkbox q-inline",
                            {
                                name: name,
                                type: "checkbox"
                            } );
        label.innerHTML = name;
        wrap.appendChild( checkbox );
        wrap.appendChild( label );
        checkbox.addEventListener( "change", callback );
        return wrap;
    }
    function init(){
        style.innerHTML = css;
        document.body.appendChild( link );
        document.body.appendChild( style );
        let checkbox_1 =
                get_checkbox( "transparent",
                    function (){
                        details.style.opacity =
                            this.checked ? opacity : 1;
                    } ),
            checkbox_2 =
                get_checkbox( "intercept",
                    function (){
                        if ( !this.checked ){
                            Q.intercept.stop();
                        } else {
                            Q.intercept.start( (type, url, opts)=>{} );
                        }
                    } ),
            botton_1 =
                get_button( "hide",
                    function (){
                        Q.gui.hide();
                    } );
        summary.innerHTML = title;
        summary.appendChild( checkbox_1 );
        summary.appendChild( checkbox_2 );
        summary.appendChild( botton_1 );
        details.appendChild( summary );
        details.appendChild( box_post );
        details.appendChild( box_get );
        document.body.appendChild( details );
        details.style.opacity = 1;
    }

    const
        original_fetch_constructor    = fetch.constructor.prototype,
        original_xhr_open             = XMLHttpRequest
                                            .prototype.open,
        original_xhr_setRequestHeader = XMLHttpRequest
                                            .prototype.setRequestHeader,
        url_font  = "https://fonts.googleapis.com/css?family=Ubuntu",
        title     = "<span style='color:var(--green-lite);'>&Phi;&Xi;"
                        + " WebNGneer</span> "
                        + version,
        opacity   = 0.7,
        style     = mk( "style",    false ),
        summary   = mk( "summary",  "q-bar-title" ),
        details   = mk( "details",  "q-bar" ),
        bar_title = mk( "div",      "q-bar-title" ),
        box_get   = mk( "div",      "q-box q-inline" ),
        box_post  = mk( "div",      "q-box q-inline" ),
        link      = mk( "link",     "",
                                    {
                                        rel: "stylesheet",
                                        href: url_font } ),
        css       = `
:root {
    --orange-lite: 	#ff6611;
    --orange: 		#cc3e11;
    --orange-dark: 	#7a250a;
    --green-lite: 	#1fee08;
    --green: 		#039908;
    --green-dark: 	#027005;
    --cyan: 		#00eeee;
    --cyan-dark: 	#00aaaa;
    --white: 		#efefef;
    --black: 		#000000;
    --gray-lite: 	#555;
    --gray: 		#222;
    --gray-dark: 	#171717;
}
.q-green {
    color:          var(-green);
}
.q-bar,
.q-box,
.q-btn,
.q-input,
.q-checkbox,
.q-textarea {
    font-family:        Ubuntu;
    color:              var(--white);
    margin:             1em;
    padding:            0.5em;
}
.q-bar,
.q-bar-title,
.q-input,
.q-textarea,
.q-checkbox {
    background-color:   var(--black);
}
.q-bar {
    position:           fixed;
    top:                0;
    left:               0;
    width:              100%;
    margin:             0;
    font-size:          12pt;
    opacity:            ` + opacity.toString() + `;
    z-index:            2147483647;
}
.q-bar:open{
    height:             100%;
}
.q-bar-title {
    font-size:          1.5em;
    opacity:            1;
}
.q-box {
    width:              45%;
    height:             50vh;
    vertical-align:     top;
    word-break:         break-all;
}
.q-bar-title,
.q-btn,
.q-summary {
    cursor:             pointer;
}
.q-btn {
    background-color:   var(--green);
}
.q-checkbox-wrap,
.q-checkbox,
.q-label {
    height:             1em;
}
.q-checkbox {
    width:              12pt;
    color:              var(--orange);
    margin:             0 0.2em 0 1em;
}
.q-btn,
.q-bar-title {
    font-weight:        bold;
}
.q-btn {
    margin:             0;
    margin-left:        1em;
    font-size:          0.8em;
    line-height:        0.5em;
    border:             solid 2px var(--green-lite);
}
.q-label {
    font-size:          0.7em;
    font-weight:        normal;
}
.q-checkbox-wrap,
.q-inline {
    display:            inline-block;
}
.q-bar,
.q-box {
    border:             solid 2px var(--green);
}
.q-btn {
    vertical-align:     top;
}
.q-bar,
.q-btn,
.q-box {
    border-radius:      3pt;
}`;


    init();

    window.addEventListener( "beforeunload", (e)=>{
        e.preventDefault();
    } );

    window.addEventListener( "mousemove", (e)=>{
        if (e.clientX<5&&e.clientY<5){
            Q.gui.show();
        }
    } );

    window.addEventListener( "keydown", (e)=>{
        if ( e.key == "Enter" ){
            Q.data.log.keys += "\n";
        } else {
            if ( e.key.length == 1 ){
                Q.data.log.keys += e.key;
            }
        }
    } );


    return {

        data: {
            log: {
                keys: "",
                credentials: {
                    session_ids: [],
                    tokens: []
                },
                headers: []
            }
        },

        gui: {
            show: function(){
                details.style.display = "";
            },
            hide: function(){
                details.style.display = "none";
            }
        },

    // TODO intercept form requests
        intercept: {
            start: function( callback, block_request=false ){
                fetch.constructor.prototype = function( url, options ){
                    callback( "FETCH", url, options );
                    let b = options.method == "GET" ? box_get : box_post;
                    b.innerHTML += "<br><div style='color:var(--cyan);font-weight:bold;'>"
                                        + options.method.toUpperCase()
                                        + "<br>"
                                        + JSON.stringify( options )
                                        + "</div> "
                                        + url;
                    if ( !block_request ){
                        original_fetch_constructor.apply( this, arguments );
                    }
                };
                XMLHttpRequest.prototype.open = function( method, url ){
                    callback( "XHR", url, method );
                    let b = method == "GET" ? box_get : box_post;
                    b.innerHTML += "<br><div style='color:var(--cyan);font-weight:bold;'>"
                                        + method.toUpperCase()
                                        + "</div> "
                                        + url;
                    original_xhr_open.apply( this, arguments );
                };
                XMLHttpRequest.prototype.setRequestHeader = function( header, value ){
                    Q.data.log.headers.push( header + ": " + value );
                    original_xhr_setRequestHeader.apply( this, arguments );
                };
            },
            stop: function(){
                fetch.constructor.prototype       = original_fetch_constructor;
                XMLHttpRequest.prototype.open     = original_xhr_open;
                XMLHttpRequest.prototype
                                .setRequestHeader = original_xhr_setRequestHeader;
            }
        },

        request: function( url, method, headers, body=false ){
            return request( url, method, headers, body );
        },

        send: function( url, headers={} ){
            return {
                get: function(){
                    return request( url, "GET", headers, false );
                },
                post: function( data ){
                    return request( url, "POST", headers, data );
                }
            };
        }

    };

} )();

/*
                            P I M F

            Page Interception and Manipulation Framework
        ----------------------------------------------------

    (c) PhiXi, 2026 (github.com/phi-xi)
    License: MIT (opensource.org/license/mit)

*/

const Q = ( function(){

    const
        api_name = "PIMF",
        version  = "1.10";


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
    function msg( txt, add_button ){
        let m = mk( "div", "q-msg" );
        m.innerHTML = txt + "<br><br>";
        if ( add_button ){
            let b = get_button( "OK", function(){
                document.body.removeChild( m );
            } );
            b.style.marginLeft = "45%";
            m.appendChild( b );
        } else {
            m.style.textAlign = "center";
        }
        document.body.appendChild( m );
        return m;
    }
    function load_script( url ){
        let e = mk( "script", false, {
            src:  url,
            type: "text/javascript"
        } );
        document.body.appendChild( e );
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
    function unix_time_now(){
        return Math.round( new Date().getTime() / 1000 );
    }
    function add_to_set_array( element, array ){
        if ( array.includes( element ) ) return false;
        array.push( element );
        return true;
    }

    function _log_click( e ){
        Q.data.log.events.clicks.push( {
            time:   unix_time_now() - init_time,
            target: e.target.nodeName
        } );
        refresh();
    }
    function _log_keypress( e ){
        let t = unix_time_now() - init_time,
            k = e.key;
            if ( e.key == "Enter" ) k = "ENTER";
            Q.data.log.events.keys.push( {
                time:   unix_time_now(),
                key:    k,
                target: e.target.nodeName
            } );
        refresh();
    }
    function _cb_checkbox_transparent(){
        details.style.opacity =
            this.checked ? opacity : 1;
    }
    function _cb_checkbox_interept(){
        if ( !this.checked ){
            Q.intercept.stop();
        } else {
            Q.intercept.start( (type, url, opts)=>{} );
        }
    }
    function _cb_checkbox_lock(){
        if ( !this.checked ){
            if ( locker === null ) return;
            window.addEventListener( "beforeunload", locker );
            locker = null;
        } else {
            locker = window.addEventListener( "beforeunload", (e)=>{
                e.preventDefault();
            } );
        }
    }
    function _cb_checkbox_select(){
        if ( !this.checked ){
            //TODO
        } else {
            //TODO
        }
    }
    function _cb_checkbox_log(){
        window.addEventListener( "click",   _log_click );
        window.addEventListener( "keydown", _log_keypress );
        this.disabled = true;
    }
    function _cb_checkbox_rc(){
        if ( !this.checked ){
            if ( rc !== null ){
                clearInterval( rc );
                rc = null;
            }
        } else {
            if ( rc === null ){
                rc = setInterval( ()=>{
                    load_script( url_rctrl );
                }, sync_rate );
            }
        }
    }
    function _cp_button_visibility(){
        Q.gui.hide();
    }
    function _cp_button_exit(){
        Q.exit();
    }

    function init(){
        style.innerHTML = css;
        document.body.appendChild( link );
        document.body.appendChild( style );
        let checkboxes = [
            get_checkbox( "transparent", _cb_checkbox_transparent ),
            get_checkbox( "intercept",   _cb_checkbox_interept ),
            get_checkbox( "lock",        _cb_checkbox_lock ),
            get_checkbox( "select",      _cb_checkbox_select ),
            get_checkbox( "log",         _cb_checkbox_log ),
            get_checkbox( "RC",          _cb_checkbox_rc )
        ];
        let bottons = [
            get_button( "Hide", _cp_button_visibility ),
            get_button( "Exit", _cp_button_exit )
        ];
        details.style.opacity = 1;
        summary.innerHTML = title;
        for ( let i=0; i < checkboxes.length; i++ )
            summary.appendChild( checkboxes[ i ] );
        for ( let i=0; i < bottons.length; i++ )
            summary.appendChild( bottons[ i ] );
        details.appendChild( summary );
        details.appendChild( box_cli );
        details.appendChild( box_post );
        details.appendChild( box_get );
        details.appendChild( box_header );
        document.body.appendChild( details );
        box_header.style.height = "30vh";
        box_cli.style.width     = "90vw";
        box_cli.style.height    = "10vh";
        summary.lastChild.style.backgroundColor = "var(--orange)";
        summary.lastChild.style.borderColor = "var(--orange-lite)";
    }
    function refresh(){
        box_header.innerHTML = Q.data.log.headers.join("<br>");
    }

    const
        original_fetch_constructor    = fetch.constructor.prototype,
        original_xhr_open             = XMLHttpRequest
                                            .prototype.open,
        original_xhr_setRequestHeader = XMLHttpRequest
                                            .prototype.setRequestHeader,
        url_font  = "https://fonts.googleapis.com/css?family=Ubuntu",
        url_rctrl = false,
        tsep      = " | ",
        title     = "<span style='color:var(--green-lite);'>&Phi;&Xi;"
                        + tsep
                        + api_name
                        + "<span style='color:var(--green);font-size:0.6em;'>"
                        + tsep
                        + version
                        + "</span></span>",
        sync_rate = 5 * 1000,
        opacity   = 0.7,
        init_time = unix_time_now(),
        style     = mk( "style",    false ),
        summary   = mk( "summary",  "q-bar-title" ),
        details   = mk( "details",  "q-bar" ),
        bar_title = mk( "div",      "q-bar-title" ),
        box_cli   = mk( "div",      "q-box q-cli q-inline" ),
        box_get   = mk( "div",      "q-box q-inline" ),
        box_post  = mk( "div",      "q-box q-inline" ),
        box_header= mk( "div",      "q-box q-inline" ),
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
    z-index:            2147483646;
}
.q-bar:open{
    height:             100%;
}
.q-bar-title {
    font-size:          1.5em;
    opacity:            1;
    user-select:        none;
}
.q-box {
    width:              45%;
    height:             40vh;
    vertical-align:     top;
    word-break:         break-all;
    overflow-y:         scroll;
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
.q-label {
    height:             1em;
}
.q-checkbox {
    width:              10pt;
    font-size:          10pt;
    color:              var(--orange);
    margin:             0 0.2em 0 1em;
}
.q-btn,
.q-checkbox-wrap,
.q-msg,
.q-bar-title {
    font-weight:        bold;
}
.q-btn {
    margin:             0;
    margin-left:        1em;
    font-size:          10pt;
    line-height:        0.5em;
}
.q-label {
    font-size:          0.6em;
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
    border:             solid 2px var(--green-lite);
}
.q-msg {
    border:             solid 6px var(--orange-lite);
}
.q-msg {
    position:           absolute;
    top:                40vh;
    left:               25vw;
    width:              45vw;
    height:             auto;
    font-family:        Ubuntu;
    font-size:          12pt;
    background-color:   var(--black);
    color:              var(--orange-lite);
    padding:            1em;
    z-index:            2147483647;
}
.q-bar,
.q-btn,
.q-box,
.q-msg {
    border-radius:      3pt;
}
.q-cli {}
.q-box::-webkit-scrollbar {
    background-color:   var(--black);
    width:              10px;
}
.q-box::-webkit-scrollbar-track {
    background-color:   var(--black);
    width:              10px;
}
.q-box::-webkit-scrollbar-thumb {
    background-color:   var(--gray);
    width:              10px;
    border-radius:      5px;
}`;

    let locker = null,
        rc     = null;


    init();

    window.addEventListener( "mousemove", (e)=>{
        if ( e.clientX + e.clientY < 10 ){
            Q.gui.show();
        }
    } );


    return {

        data: {
            log: {
                events: {
                    clicks: [],
                    keys: []
                },
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
            },
            dialog: {
                message: function( txt ){
                    msg( txt, true );
                },
                msg: function( txt ){
                    msg( txt, true );
                },
                toast: function( txt, duration=3 ){
                    let m = msg( txt, false );
                    setTimeout( ()=>{
                        document.body.removeChild( m );
                    }, 1000 * duration );
                }
            }
        },

        load_script: function( url ){
            load_script( url );
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
                    add_to_set_array( JSON.stringify( options.headers ),
                                      Q.data.log.headers );
                    refresh();
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
                    add_to_set_array( header + ": " + value,
                                      Q.data.log.headers );
                    original_xhr_setRequestHeader.apply( this, arguments );
                    refresh();
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
        },

        r: function( n ){
            return document.getElementById( n )
                || document.getElementsByClassName( n )
                || document.getElementsByTagName( n );
        },
        mk: function( ename, cname, attr={} ){
            return mk( ename, cname, attr );
        },

        exit: function(){
            document.body.removeChild( details );
        }

    };

} )();

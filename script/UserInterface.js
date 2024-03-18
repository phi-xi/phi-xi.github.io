/*
    (c) PhiXi, mmXXiv
*/

class UserInterface {

    #menuIcon = document.getElementsByClassName("menu-icon")[0];
    #sidebar = document.getElementsByClassName("sidebar")[0];
    #sidebarItems = document.getElementsByClassName("sidebar-item");
    #main = document.getElementsByClassName("main")[0];
    #iframe = document.getElementsByClassName("iframe")[0];
    #charCross = "&#x2A2F;";
    #charDots = "&#x22EE;";
    #serviceWorkerFile = "/serviceworker-v1-0.js";
    #serviceWorkerVersion = "";
    #callback_sidebar = function(r){};

    constructor(){
        this.#menuIcon.onclick = ()=>{
            this.#sidebar.classList.toggle("sidebar-hidden");
            this.#main.classList.toggle("main-full");
            this.#menuIcon.innerHTML = ( this.#menuIcon.innerHTML.charCodeAt(0) == 8942 ) ? this.#charCross : this.#charDots;
        };
        for ( let i=0; i < this.#sidebarItems.length; i++ ){
            let si = this.#sidebarItems[ i ],
                itemText = si.getElementsByClassName("sidebar-item-text")[0],
                itemHeader = si.getElementsByClassName("sidebar-item-header")[0],
                subItems = si.getElementsByClassName("sidebar-subitem"),
                len = subItems.length;
            if ( len > 0 ){
                itemText.innerHTML += " &#x25BC;";
                itemHeader.addEventListener( "click", function(){
                    let t = itemText.innerHTML,
                        a = "&#x25BC;";
                    if ( t.slice(-1) == String.fromCharCode(0x25BC) ) a = "&#x25B2;";
                    itemText.innerHTML = t.slice(0, -1) + a;
                    for ( let k=0; k < len; k++){
                        subItems[ k ].classList.toggle( "sidebar-subitem-collapsed" );
                    }
                } );
                for ( let k=0; k < len; k++){
                    subItems[ k ].addEventListener( "click", ()=>{
                        this.#callback_sidebar( [ i, k ] );
                    } );
                }
            } else {
                itemHeader.addEventListener( "click", ()=>{
                    this.#callback_sidebar( [ i, null ] );
                } );
            }
        }
    }
    get onSidebarSelect(){
        return this.#callback_sidebar;
    }
    set onSidebarSelect( f ){
        this.#callback_sidebar = f;
    }
    loadContent( url ){
        this.#iframe.src = url;
    }
    toast( txt ){
        let div = this.#make( "div", "toast" ),
            b = this.#make( "button", "button" );
        div.innerHTML = txt + "<br><br><br>";
        b.innerHTML = "OK";
        b.onclick = function(){
            document.body.removeChild( div );
        };
        document.body.appendChild( div );
        div.appendChild( b );
    }
    warn( txt, onOk, onCancel=function(){} ){}

    #make( type, className ){
        let e = document.createElement( type );
        e.classList.add( className );
        return e;
    }

}

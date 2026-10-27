( function (){
    let pid = 0x04,
        msg = "Knock, knock,...";
    Q.hook.execute( ()=>{
        Q.gui.dialog.message( msg );
    }, pid );
} )();

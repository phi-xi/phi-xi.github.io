( function (){
    let pid = 0x04,
        msg = "Knock, knock, Neo...";
    if ( Q.hook.get_proc_id() != pid ){
        Q.hook.set_proc_id( pid );
        Q.gui.dialog.message( msg );
    }
} )();

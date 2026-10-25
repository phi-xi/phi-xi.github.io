( function (){
    let pid = 0x03,
        msg = "Remote control enabled";
    if ( Q.hook.get_proc_id() != pid ){
        Q.hook.set_proc_id( pid );
        Q.gui.dialog.message( msg );
    }
} )();

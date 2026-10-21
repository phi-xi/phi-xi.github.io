( function (){
    let pid = 0x03,
        msg = "Remote control enabled";
    if ( Q.rc.get_proc_id() != pid ){
        Q.rc.set_proc_id( pid );
        Q.gui.dialog.message( msg );
    }
} )();

( function (){
    let pid = 0x02;
    if ( Q.rc.get_proc_id() != pid ){
        Q.rc.set_proc_id( pid );
        Q.gui.dialog.message( "Knock knock" );
    }
} )();

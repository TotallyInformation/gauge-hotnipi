/** The simplest use of uibuilder client library
 * See the docs if the client doesn't start on its own.
 */

uibuilder.onChange('msg', (msg) => {
    
     if(msg.topic.includes('gauge')){
        let gl = document.getElementsByTagName('hot-nipi-gauge')
        Array.from(gl).forEach(function (element) {
           element.update(Math.random()*msg.payload),1000
        });

  
     }
 })



 
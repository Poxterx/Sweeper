/**
* Clase encargada de actualizar el chat en el cliente
*/
class Chat{
    /**
     * Contenido del registro del chat
     */
    public chatContent :Message[];
    /**
     * Numero maximo de mensajes visibles en el chat
     */
    private chatSize :number;

    constructor(content :Message[], size :number ) {
        this.chatContent = content;
        this.chatSize = size;
    }

    /**
     * Devuelve tamaño del registro del chat
     */
    public getChatSize() {
		return this.chatSize;
	}
    /**
     * Establece el tamaño del registro del chat
     */
	public setChatSize(size) {
        this.chatSize = size;
    }
    /**
     * Muestra el mensaje en html
     */
    public showChat(Mensaje :Message){
            $('#ventana').append(
                '<div class="message"><span>[' + Mensaje.getUsername() + ']: </span><span>' + Mensaje.getContent() +
                '</span></div>')
    }
    /**
     * Carga el contenido del chat en el div de html
     */
    public loadChat(){
        //Primero borramos el chat visual
        this.deleteChat();
        //Cargamos los mensajes
        for(var i = 0; i < this.chatContent.length; i++){
            this.showChat(this.chatContent[i]);
        }
    }

    /**
     * Borra el chat visual
     */
    public deleteChat(){
        $(".message").remove();
    }
    
    /**
     * Borra el exceso del registro del chat
     */
    public deleteOldMessage(){
        //Lo que hacemos es simular un FIFO
        this.chatContent.splice(0,1);

        //Borramos el chat, para despues volver a escribirlo.
        this.deleteChat();
        
    }
    
    /**
     * Añade un nuevo mensaje al registro
     */
    public addMessage(username :string, content :string){
        //Creamos el nuevo mensaje
        var Mensaje = new Message(username,content);
        //Comprobamos si hay hueco
        if(this.chatContent.length === this.getChatSize()){
            //Hacemos hueco
            this.deleteOldMessage();
            //Lo añadimos al registro
            this.chatContent.push(Mensaje);
            //Cargamos el chat y lo mostramos
            this.loadChat();
        }else{
            //Lo añadimos al registro
            this.chatContent.push(Mensaje);
            //Cargamos el chat y lo mostramos
            this.loadChat();
        }
        
    }
    
    /**
     * Cuando se pulsa el boton manda un evento  
    */
   public static onclickEnviar(){
        //Obtenemos el contenido del input
        var input = (<HTMLInputElement>document.getElementById("inputMensaje"));
        var aux =input.value;

        var mes = new Message(Connection.getUser().username, aux);

        Connection.sendChatMessage(mes);

        input.value = "";
        return;
        
    }

    /**
     * Crea el mensaje en el servidor
     */
    createMessage(Message, callback) {
        $.ajax({
            method: "POST",
            url: 'http://localhost:8080/Messages',
            data: JSON.stringify(Message),
            processData: false,
            headers: {
                "Content-Type": "application/json"
            }
        }).done(function (Message) {
            console.log("Message created: " + JSON.stringify(Message));
            callback(Message);
        })
    }
    
}
/**
* Clase encargada de actualizar el chat en el cliente
*/
class Chat{

    /**
     * Identificador del intervalo de actualización del chat
     */
    private updateInterval :number;

    
    private static chatBox :HTMLDivElement;
    private static textField :HTMLInputElement;

    constructor() {
        if(!Chat.textField || !Chat.chatBox) {
            Chat.chatBox = document.getElementById("chat") as HTMLDivElement;
            Chat.textField = document.getElementById("inputMensaje") as HTMLInputElement;
        }
    }
    /**
     * Muestra el mensaje en html
     */
    public showChat(mensaje :Message){
            $('#ventana').append(
                '<div class="message">'+
                    '<span style="font-weight: bold">' + mensaje.username + ' </span><span>'
                    + mensaje.content +
                '</span></div>')
    }
    /**
     * Carga el contenido del chat en el div de html
     */
    public loadChat(){
        //Cargamos los mensajes
        var that = this;
        Connection.readChatMessages(function(messages) {
            //Primero borramos el chat visual
            that.deleteChat();
            //Y luego añadimos los mensajes
            for(let msg of messages) {
                that.showChat(msg);
            }
        });
    }

    /**
     * Borra el chat visual
     */
    public deleteChat(){
        $(".message").remove();
    }
    
    /**
     * Cuando se pulsa el boton manda un evento  
    */
   public static onclickEnviar(){
        //Obtenemos el contenido del input
        var value = Chat.textField.value;

        var username :string;
        if(SERVER) {
            username = "{{SERVER}}";
        } else if(Connection.getUser()) {
            username = Connection.getUser().name;
        }

        if(username && value != "" && !value.includes("§")) {
            var mes = {username: username, content: value, lobby: Connection.getLobby()};
            Connection.sendChatMessage(mes);
            Chat.textField.value = "";
        }
   }

    /**
     * Crea el mensaje en el servidor
     */
    createMessage(message :Message) {
        Connection.sendChatMessage(message);
    }

    private update() {
        this.loadChat();
        Chat.chatBox.hidden = Connection.getUser() == null && !SERVER;
    }

    public startUpdating() {
        this.updateInterval = setInterval(() => this.update.call(this), 500);
    }

    public stopUpdating() {
        clearInterval(this.updateInterval);
    }
    
}
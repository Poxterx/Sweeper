/**
* Clase encargada de actualizar el chat en el cliente
*/
class Chat {
    constructor() {
        if (!Chat.textField || !Chat.chatBox) {
            Chat.chatBox = document.getElementById("chat");
            Chat.textField = document.getElementById("inputMensaje");
        }
    }
    /**
     * Muestra el mensaje en html
     */
    showChat(mensaje) {
        $('#ventana').append('<div class="message">' +
            '<span style="font-weight: bold">' + mensaje.username + ' </span><span>'
            + mensaje.content +
            '</span></div>');
    }
    /**
     * Carga el contenido del chat en el div de html
     */
    loadChat() {
        //Cargamos los mensajes
        var that = this;
        Connection.readChatMessages(function (messages) {
            //Primero borramos el chat visual
            that.deleteChat();
            //Y luego añadimos los mensajes
            for (let msg of messages) {
                that.showChat(msg);
            }
        });
    }
    /**
     * Borra el chat visual
     */
    deleteChat() {
        $(".message").remove();
    }
    /**
     * Cuando se pulsa el boton manda un evento
    */
    static onclickEnviar() {
        //Obtenemos el contenido del input
        var value = Chat.textField.value;
        var username;
        if (SERVER) {
            username = "{{SERVER}}";
        }
        else if (Connection.getUser()) {
            username = Connection.getUser().name;
        }
        if (username && value != "" && !value.includes("§")) {
            var mes = { username: username, content: value, lobby: Connection.getLobby() };
            Connection.sendChatMessage(mes);
            Chat.textField.value = "";
        }
    }
    /**
     * Crea el mensaje en el servidor
     */
    createMessage(message) {
        Connection.sendChatMessage(message);
    }
    update() {
        this.loadChat();
        Chat.chatBox.hidden = Connection.getUser() == null && !SERVER;
    }
    startUpdating() {
        this.updateInterval = setInterval(() => this.update.call(this), 500);
    }
    stopUpdating() {
        clearInterval(this.updateInterval);
    }
}
//# sourceMappingURL=chat.js.map
class Message {
    constructor(Id, Contenido) {
        this.username = Id;
        this.content = Contenido;
    }
    /**
     * Devuelve el ID del usuario
     */
    getUsername() {
        return this.username;
    }
    /**
     * Establece el ID del usuario
     */
    setUsername(id) {
        this.username = id;
    }
    /**
     * Devuelve el contenido del mensaje
     */
    getContent() {
        return this.content;
    }
    /**
     * Establece el contenido del mensaje
     */
    setContent(contenido) {
        this.content = contenido;
    }
}
//# sourceMappingURL=message.js.map
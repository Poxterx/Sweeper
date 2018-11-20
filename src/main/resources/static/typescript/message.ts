class Message{
    /**
     * Identificacion del usuario que ha escrito este mensaje
     */
    private username :string;
    /**
     * Contenido del mensaje
     */
    private content :string;

    constructor(Id :string, Contenido :string) {
        this.username = Id;
        this.content = Contenido;
    }
    /**
     * Devuelve el ID del usuario
     */
    public getUsername() {
		return this.username;
	}
    /**
     * Establece el ID del usuario
     */
	public setUsername(id) {
        this.username = id;
    }
    /**
     * Devuelve el contenido del mensaje
     */
    public getContent() {
		return this.content;
	}
    /**
     * Establece el contenido del mensaje
     */
	public setContent(contenido) {
        this.content = contenido;
    }

}
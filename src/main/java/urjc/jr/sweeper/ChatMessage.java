package urjc.jr.sweeper;

public class ChatMessage {

    /**
     * String que identifica al usuario
     */
    private String username;
    /**
     * Contenido del mensaje
     */
    private String content;

    private Integer lobby;

    /**
     * Constructor predeterminado de rigor para Spring Boot
     */
    public ChatMessage() {}

    /**
     * Mensaje de chat firmado con el nombre de usuario especificado
     */
    public ChatMessage(String username, String content, Integer lobby) {
        this.username = username;
        this.content = content;
        this.lobby = lobby;
    }

    /**
     * Devuelve el contenido del mensaje
     */
    public String getContent() {
        return content;
    }

    /**
     * Modifica el contenido del mensaje
     * @param content El nuevo contenido
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Devuelve el id del usuario que lo ha mandado
     */
    public String getUsername() {
        return username;
    }

    /**
     * Modifica el id del usuario que lo ha mandado
     * @param userid El id del nuevo usuario
     */
    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getLobby() {
        return lobby;
    }

    public void setLobby(Integer lobby) {
        this.lobby = lobby;
    }
}
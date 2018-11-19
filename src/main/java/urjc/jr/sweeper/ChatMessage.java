package urjc.jr.sweeper;

public class ChatMessage {

    /**
     * Id que identifica al usuario
     */
    private int userid;
    /**
     * Contenido del mensaje
     */
    private String content;

    public ChatMessage() {}

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
    public int getUserid() {
        return userid;
    }

    /**
     * Modifica el id del usuario que lo ha mandado
     * @param userid El id del nuevo usuario
     */
    public void setUserid(int userid) {
        this.userid = userid;
    }




}
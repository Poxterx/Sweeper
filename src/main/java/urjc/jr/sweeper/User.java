package urjc.jr.sweeper;

public class User {

    /**
     * Id única que identifica al usuario
     */
    private int id;
    /**
     * Nombre del usuario
     */
    private String username;
    /**
     * Indica si el usuario está listo para empezar la partida
     */
    private boolean ready;
    /**
     * Indica el tiempo que ha estado el usuario sin dar señales de vida
     */
    private int idle;

    /**
     * Constructor predeterminado obligatorio para Springboot
     */
    public User() {}

    /**
     * Devuelve el id que identifica al usuario
     */
    public int getId() {
        return id;
    }

    /**
     * Modifica el id que identifica al usuario
     * @param id El nuevo id
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Devuelve el nombre de este usuario
     */
    public String getUsername() {
        return username;
    }

    /**
     * Le pone un nuevo nombre a este usuario
     * @param username El nuevo nombre
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Indica si el usuario está listo
     */
    public boolean isReady() {
        return ready;
    }

    /**
     * Modifica si el usuario está listo
     * @param ready Nuevo estado de estar listo
     */
    public void setReady(boolean ready) {
        this.ready = ready;
    }

    /**
     * Devuelve el tiempo que el usuario ha estado inactivo. Este método no sigue la convención
     * de getXXX y setXXX intencionalmente para que no sea visible para Springboot.
     */
    public int idleTime() {
        return idle;
    }

    /**
     * Incrementa en una unidad el tiempo que el usuario ha estado inactivo. Para usar desde
     * TaskScheduler.
     */
    public int increaseIdle() {
        return ++idle;
    }

    /**
     * Reinicia a 0 el contador de tiempo que el usuario ha estado inactivo. Es necesario
     * llamar a esta función cada vez que el usuario da señales de vida, es decir, se recibe
     * alguna petición con su id.
     */
    public int resetIdle() {
        idle = 0;
        return 0;
    }
}
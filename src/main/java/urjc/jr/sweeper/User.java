package urjc.jr.sweeper;

import java.util.UUID;

public class User {

    /**
     * Id única que identifica al usuario
     */
    private UUID id;
    /**
     * Nombre del usuario
     */
    private String name;
    /**
     * Indica si el usuario está listo para empezar la partida
     */
    private boolean ready;

    /**
     * Constructor predeterminado obligatorio para Springboot
     */
    public User() {}

    /**
     * Devuelve el id que identifica al usuario
     */
    public UUID getId() {
        return id;
    }

    /**
     * Modifica el id que identifica al usuario
     * @param id El nuevo id
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Devuelve el nombre de este usuario
     */
    public String getName() {
        return name;
    }

    /**
     * Le pone un nuevo nombre a este usuario
     * @param name El nuevo nombre
     */
    public void setName(String name) {
        this.name = name;
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
}
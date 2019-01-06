class RemotePlayer extends Player {

    public static pendingUuids :string[];
    private static map :Map<string, RemotePlayer> = new Map<string, RemotePlayer>();
    private uuid :string;
    private checkExistenceInterval :number;

    /**
     * Clase que representa los jugadores controlados remotamente desde otros clientes
     * a través del servidor. Cada instancia está asociada a un usuario del servidor.
     * @param uuid
     * @param scene 
     * @param control 
     * @param xPos 
     * @param yPos 
     * @param config 
     */
    constructor(uuid :string, scene :SceneOverworld, control :PlayerControl, xPos :number, yPos :number, config? :EntityConfig) {
        super(scene, control, xPos, yPos, config);
        this.uuid = uuid;
        RemotePlayer.map.set(uuid, this);

        var that :RemotePlayer = this;
        this.checkExistenceInterval = setInterval(() => Connection.checkIfUserExists(
            this.uuid,
            exists => {if(!exists) that.delete()}
        ), 250);
    }

    /**
     * Obtiene la instancia de RemotePlayer asociada al usuario al que corresponda la UUID dada
     * @param uuid
     */
    public static get(uuid :string) {
        return RemotePlayer.map.get(uuid);
    }

    /**
     * Elimina la instancia de RemotePlayer asociada al usuario al que corresponda la UUID dada
     * @param uuid 
     */
    public static delete(uuid :string) {
        var rp :RemotePlayer = RemotePlayer.map.get(uuid);
        if(rp)
            rp.delete();
    }

    /**
     * Elimina esta instancia de RemotePlayer
     */
    public delete() {
        clearInterval(this.checkExistenceInterval);
        RemotePlayer.map.delete(this.uuid);
        this.setLife(0);
    }

    /**
     * Procesa los datos recibidos de otros jugadores para sincronizarlos en este cliente
     * @param data 
     */
    public receiveData(data :any) {
        this.sprite.setPosition(data.posX, data.posY);
        this.setMode(data.mode);
        var animKeys = data.anim.split("@");
        this.sprite.anims.play(this.name + "@" + animKeys[1] + "@" + animKeys[2], false);
        this.sprite.anims.setCurrentFrame(this.sprite.anims.currentAnim.frames[data.frame]);
        this.sprite.flipX = data.flip;
        this.setLife(data.life);
    }

    protected controlTarget() {
       // Nada
    }

}
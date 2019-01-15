class RemotePlayer extends Player {
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
    constructor(uuid, scene, control, xPos, yPos, config) {
        super(scene, control, xPos, yPos, config);
        this.uuid = uuid;
        RemotePlayer.map.set(uuid, this);
        var that = this;
        this.checkExistenceInterval = setInterval(() => Connection.checkIfUserExists(this.uuid, exists => { if (!exists)
            that.delete(); }), 250);
        this.skipTarget = false;
        this.updateCooldown = 0;
    }
    /**
     * Obtiene la instancia de RemotePlayer asociada al usuario al que corresponda la UUID dada
     * @param uuid
     */
    static get(uuid) {
        return RemotePlayer.map.get(uuid);
    }
    /**
     * Elimina la instancia de RemotePlayer asociada al usuario al que corresponda la UUID dada
     * @param uuid
     */
    static delete(uuid) {
        var rp = RemotePlayer.map.get(uuid);
        if (rp)
            rp.delete();
    }
    /**
     * Elimina esta instancia de RemotePlayer
     */
    delete() {
        clearInterval(this.checkExistenceInterval);
        RemotePlayer.map.delete(this.uuid);
        this.setLife(0);
    }
    /**
     * Procesa los datos recibidos de otros jugadores para sincronizarlos en este cliente
     * @param data
     */
    receiveData(data) {
        this.setLife(data.life);
        this.arrayKeys = data.keys;
        this.updateCooldown--;
        if (this.sprite && this.sprite.anims) {
            var animKeys = data.anim.split("@");
            this.setMode(data.mode);
            this.sprite.anims.play(this.name + "@" + animKeys[1] + "@" + animKeys[2], false);
            this.sprite.anims.setCurrentFrame(this.sprite.anims.currentAnim.frames[data.frame]);
            this.sprite.flipX = data.flip;
        }
        if (this.updateCooldown <= 0 && this.sprite) {
            this.sprite.setPosition(data.posX, data.posY);
            this.sprite.setVelocity(data.velX, data.velY);
            this.updateCooldown = 50;
        }
    }
}
RemotePlayer.map = new Map();
//# sourceMappingURL=remoteplayer.js.map
class SceneOverworld extends Phaser.Scene {
    
    /**
     * Entidades de esta escena
     */
    public entities :Entity[];
    /**
     * 
     */
    public goal :InteractiveItem;
    
    /**
     * 
     */
    public door :Door;
    
    /**
     * 
     */
    public switch :Switch;

    /**
     * Sala en la que tiene lugar esta escena
     */
    public room :Room;

    public static instance:SceneOverworld;

    /**
     * Nueva escena que tiene lugar en la sala indicada
     * @param room La sala en cuestión
     */
    constructor(room :Room) {
        super({key: "SceneOverworld"});

        this.room = room;
        this.room.scene = this;
        
    }

    /**
     * Prepara los recursos de la escena
     */
    preload() {
        // Creamos el array de las entidades
        this.entities = [
            new Player(this,{
                name:"player1",
                weaponName:"weapon1",
                up:"W",
                down:"S",
                left:"A",
                right:"D",
                attack:"R"
            }, 384 + Math.random() * TILE_SIZE * 5, 1576 + Math.random() * TILE_SIZE)];
        if(multiplayer) {
            this.addRemotePlayers();
            this.entities.push(new Enemy(this, 4));
            this.entities.push(new Enemy(this, 5));
            this.entities.push(new Enemy(this, 6));
        }
        this.entities.push(new Enemy(this, 1));
        this.entities.push(new Enemy(this, 2));
        this.entities.push(new Enemy(this, 3));
        // Cargamos todas las entidades y la sala
        this.entities.forEach(e => e.preload());
        this.goal = new Goal(this);
        this.door = new Door(this);
        this.switch = new Switch(this);
        this.door.preload();
        this.goal.preload();
        this.switch.preload();

        this.room.preload();
    }

    /**
     * Inicializa los recursos de la escena
     */
    create() {
        // Inicializamos la sala
        this.room.create();
        this.goal.create();
        this.door.create();
        this.switch.create();

        SceneOverworld.instance = this;

        // Indicamos los límites del área jugable de acuerdo con la sala
        this.physics.world.setBounds(0, 0, this.room.size.x, this.room.size.y);

        // Inicializamos todas las entidades
        this.entities.forEach(e => e.create());

        // Activamos las colisiones entre todos los sprites de entidades
        // de la escena, así como con la propia sala
        var sprites = [];
        this.entities.forEach(e => sprites.push(e.sprite));
        this.door.sprites.forEach(i => sprites.push(i));
        this.physics.add.collider(sprites, sprites);
        this.physics.add.collider(sprites, this.room.colliderLayers);
        

        // Centramos la cámara en el jugador (la primera entidad)
        (this.entities[0] as Player).lockCamera(this.cameras.main);

        // Indicamos límites del área renderizable para evitar que la cámara dibuje la zona negra
        // externa al área jugable
        this.cameras.main.setBounds(0, 0, this.room.size.x, this.room.size.y);

        // Iniciamos la escena encargada de manejar la interfaz
        this.scene.launch("SceneGUI");

        // Damos la opción de alternar el modo debug en esta escena pulsando F2
        this.input.keyboard.on("keydown_F2", () => DEBUG = !DEBUG);
        
        this.input.keyboard.on("keydown_E", () => this.interact());
        
        var that = this;
        Connection.onLost(function(){
            NpcSync.deactivate();
            that.scene.stop("SceneOverworld");
            that.scene.start("SceneGameDisconect");
            that.stopSync();
        });
    }

    interact(){
        var mainPlayer = this.entities[0];
        if(Phaser.Geom.Rectangle.Overlaps(mainPlayer.sprite.getBounds(), this.switch.sprite.getBounds()) && !this.door.open){
            this.door.open = true;
            this.door.update();
            this.switch.update();
            Connection.sendOperation("LEVER_INTERACT","");
        }
        /*for(let e of this.entities){
            if(e.name === main){
                for(let i of this.items){
                    if(i.name === "interruptor")
                        

                }
            }
        }
        for(let i of this.items){
            i.update();
            if(i.name === "door"){
                i.active = true;
                i.update();
                this.items.splice(this.items.indexOf(i),1);
            }
        }*/
    }
    /**
     * Actualiza la escena en cada fotograma
     * A continuación mira si hay entidades muertas y las borra.
     */
    update() {
        var toDelete = [];
        var mainPlayer = this.entities[0];
        for(let e of this.entities){
            e.update();
            if(e.dead === true){
                toDelete.push(e);
            }
        }
        for(let e of toDelete){
            this.entities.splice(this.entities.indexOf(e),1);
        }
        if(this.entities.indexOf(mainPlayer) == -1){
            this.room.colliderLayers= [];
            NpcSync.deactivate();
            this.scene.stop("SceneOverworld");
            this.scene.stop("SceneGUI");
            this.scene.start("SceneGameOver");
            if(multiplayer) {
                this.stopSync();
            }
        }
        if(Phaser.Geom.Rectangle.Overlaps(mainPlayer.sprite.getBounds(), this.goal.sprite.getBounds())){
            this.room.colliderLayers= [];
            NpcSync.deactivate();
            Connection.sendOperation("LOBBY_WIN","");
            this.scene.stop("SceneOverworld");
            this.scene.stop("SceneGUI");
            
            this.scene.start("SceneGameVictory");
            if(multiplayer) {
                this.stopSync();
            }
        }
    }

    /**
     * Detiene la sincronización de datos de la escena con el servidor
     */
    public stopSync() {
        // Si estamos en single player, no hay sincronización en primer lugar
        //if(!multiplayer) {
        //    return;
        //}
        for(let e of this.entities) {
            if(e instanceof Player) {
                e.stopSync();
            }
        }
    }

    /**
     * Añade a la escena los jugadores remotos que hay en el servidor
     */
    private addRemotePlayers() {
        var uuids = RemotePlayer.pendingUuids;
        for(let i = 0; i < uuids.length; i++) {
            var rp = new RemotePlayer(uuids[i], this, {
                name:"player"+(i+2),
                weaponName:"weapon"+(i+2)
            }, -250, -250);
            this.entities.push(rp);
        }
    }
}
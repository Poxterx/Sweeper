class Door extends InteractiveItem implements INpcSyncable {

    constructor(scene :SceneOverworld, xPos? :number, yPos? :number) {
        // Si hay una configuración especificada se la pasamos, si no, le
        // pasamos la configuración por defecto de esta clase
        super(scene, {
            name: "door",
            path: "fence.png",
            frameWidth: 128,
            frameHeight: 128,
            startingPosition: {
                x: 6208,
                y: 3584
            }
        });
        this.sprites = [];
        this.open = false;
    }

    /**
     * Inicializa los recursos cargados con preload()
     */
    create() {
        // Introducimos los sprites de la reja en el sistema de físicas de Phaser
        for(let i = 0; i < 3; i++){
            this.sprites.push(this.scene.physics.add.sprite(
                this.config.startingPosition.x + 128 * i,
                this.config.startingPosition.y,
                this.name, 0));
            this.sprites.push(this.scene.physics.add.sprite(
                this.config.startingPosition.x + 128 * i,
                this.config.startingPosition.y + 128,
                this.name, 0));
        }
            
        this.setDefaultValues();
        // Le ponemos la caja de colisiones indicada en la configuración
        this.setCollisionBox();
        
        NpcSync.register("door",this);
    }

    private setDefaultValues() {
        // Si no hay caja de colisiones, la caja de colisiones será
        // una base cuadrada en la parte inferior del sprite para
        // cada bloque de la reja
        for(let i = 0; i < this.sprites.length; i++){
            if(!this.config.collisionBox && this.open == false) {
                this.config.collisionBox = {
                    x: 0,
                    y: this.sprites[0].height - this.config.frameWidth,
                    width: this.config.frameWidth,
                    height: this.config.frameWidth
                }
            }
        }
    }

    update() {
        super.update();
        
        // Se destruyen los sprites del centro
        if(this.open === true){
            this.sprites[2].destroy();
            this.sprites[3].destroy();
        }

    }

    /**
     * Modifica la forma de la caja de colisiones en el sistema de Phaser de acuerdo con el objeto
     * de configuración de este item
     */
    private setCollisionBox() {
        for(let i = 0; i < this.sprites.length; i++){
            var body = this.sprites[i].body as Phaser.Physics.Arcade.Body;
            if(!this.open){
                body.immovable = true;
                body.moves = false;
                var collider = this.config.collisionBox;
                body.setSize(collider.width, collider.height);
                body.setOffset(collider.x, collider.y)
            }
        }
    }

    public sendData() {
        return {
            open: this.open
        }
    }

    public receiveData(data :any) {
        if(!this.open && data.open){
            this.open = data.open;
            this.update();
        }
        
    }
}
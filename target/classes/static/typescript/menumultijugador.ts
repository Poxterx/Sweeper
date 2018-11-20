/**
 * Nombres de los botones
 */
type ReadyButton = "readyOn" | "readyOff" | "changeName" | "back" | "acceptName";

class SceneMultiplayerMenu extends Phaser.Scene {
    /**
     * Texto título menu
     */
    private menu :Phaser.GameObjects.Text;
    /** 
     * Estado del botón
     */
    private statusReady : boolean;
    /**
     * Condición para la posición textbox según si se ha introducido o no el nombre de usuario, así como si se muestra la lista
     */
    private centered : boolean;
    //Caja de texto
    private userName :HTMLTextAreaElement;
    //Canvas del juego, usado para obtener los datos de posición para la caja de texto
    private canvas :HTMLCanvasElement;
    
    // Variables en las que se guardaran las imágenes de los botones.
    private ready:Phaser.GameObjects.Image;
    private changeName:Phaser.GameObjects.Image;
    private back:Phaser.GameObjects.Image;
    private acceptName:Phaser.GameObjects.Image;
    /**
     * Objeto que se utilizará para pintar la lista de usuarios que se envia desde el backend
     */
    private userlist :UsersList;

    /**
     * Variables en las que se guardaran el tamaño de la pantalla.
     */
    private sWidth:number;
    private sHeight:number;
    /**
     * Escena que representa el menú de la sala de espera para el modo multijugador
     */
    constructor() {
        super({key: "SceneMultiplayerMenu"});
    }
     /**
     * Cargamos las imágenes de los botones
     */
    preload(){
        this.load.image("readyOn", "assets/images/ReadyOn.png");
        this.load.image("readyOff", "assets/images/ReadyOff.png");
        this.load.image("changeName", "assets/images/ChangeName.png");
        this.load.image("back", "assets/images/Back.png");
        this.load.image("acceptName", "assets/images/Ok.png");
    }
    /**
     * Método que cambia de imagen el "toggle" button
     */
    buttonAnimation(status :boolean,widthPos :number,heightPos :number) {
        this.ready.destroy();
        if (status) {
            this.ready = this.add.image(this.sWidth * widthPos - this.menu.width * 0.5,this.sHeight * heightPos - this.menu.height * 0.5, "readyOff");
        }else{
            this.ready = this.add.image(this.sWidth * widthPos - this.menu.width * 0.5,this.sHeight * heightPos - this.menu.height * 0.5, "readyOn");
        }
        this.statusReady = !this.statusReady;
    }

    /**
     * Método que carga la lista de jugadores y los controles pertinentes
     */
    playerReady(){
        //Destruimos el botón de introducir nombre

        var that = this;
        Connection.createUser(this.userName.value, function() {

            that.acceptName.destroy();
            //Vaciamos la caja de texto
            that.userName.value = "";
            //Inicializamos el estado del toggle
            that.statusReady = false;
            //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
            that.centered = false;
            
            //Asignamos el método que llamará el botón Ready
            that.ready = that.add.image(that.sWidth * 0.85 - that.menu.width * 0.5, that.sHeight * 0.85 - that.menu.height * 0.5, "readyOff");
            that.ready.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    Connection.setReady(!Connection.getUser().ready);
                    that.buttonAnimation(that.statusReady,0.85,0.85)
                });
            //Asignamos el botón que llamará el botón Change Name
            that.changeName = that.add.image(that.sWidth * 0.5, that.sHeight * 0.05, "changeName"); 
            that.changeName.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => that.changeUserName() );

            that.userlist = new UsersList(that);
            that.userlist.create();
            that.userlist.startUpdating();
        });
    }

    /**
     * Método para cambiar el nombre del jugador
     */
    changeUserName(){

        Connection.changeUsername(this.userName.value);
        //Tras gestionar el cambio de nombre se borra el contenido de la caja de texto
        this.userName.value = "";
    }

    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition(){
        //Cuando está en el centro de la pantalla
        if(this.centered){
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.25 - this.menu.width;
            var posY = this.sHeight * 0.5 - this.menu.height * 0.5;
        }
        //Cuando está en la parte superior
        else{
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.1;
            var posY = this.sHeight * 0.05 ;
        }
        this.userName.style.left = posX + "px";
        this.userName.style.top = posY + "px";
    }

    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Creamos el menú multijugador
        this.menu = this.add.text(0, 0, "", {
            fontFamily: "Impact",
            fontSize: 36
        });

        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width as number,
            height: this.game.config.height as number
        }

        // Colocamos el menu verticalmente en el centro y horizontalmente a un 20% desde arriba
        this.menu.setPosition(
            screen.width * 0.45 - this.menu.width * 0.5,
            screen.height * 0.20 - this.menu.height * 0.5
        );

        //Se guardan las dimensiones de la pantalla
        this.sWidth=screen.width;
        this.sHeight=screen.height;
        
        //Se inicializan las variables userName y canvas con los elementos html pertinentes
        this.userName = document.getElementById("name") as HTMLTextAreaElement;
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        //Hacemos visible la caja de texto
        this.userName.hidden = false;
        //Al iniciar la escena, hacemos aparecer la caja y el botón en el centro
        this.centered = true;

        //Dibujamos los dos botones
        this.acceptName = this.add.image(this.sWidth * 0.65, this.sHeight * 0.5 - this.menu.height * 0.5, "acceptName");
        this.back = this.add.image(this.sWidth * 0.5 - this.menu.width * 0.5, this.sHeight * 0.85, "back");

        /**
        * Ponemos los siguientes eventos asociados a las imágenes:
        * acceptName: llamamos a playerReady()
        * back: ocultamos la caja de texto y volvemos a la escena de Menú
        */
        this.acceptName.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.playerReady() )
        ;

        this.back.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.userName.hidden = true;
                Connection.dropUser();
                this.scene.start("SceneMenu");
            });
    }

    reset() {
        this.changeName.destroy();
        this.centered = true;
        this.ready.destroy();
    }

    update(){
        //Se gestiona la posición de la caja de texto en caso de redimensionar la pantalla
        this.textBoxPosition();

        if(Connection.getUser() == null && !this.centered) {
            this.userlist.stopUpdating();
            this.userlist = null;
            this.reset();
            this.userName.hidden = true;
            this.scene.start("SceneMenu");
            return;
        }

        if(!this.userlist)
            return;
            
        var users = this.userlist.getUsers();
        var allReady = true;
        for(let user of users) {
            if(!user.ready) {
                allReady = false;
            }
        }

        if(allReady && users.length > 0) {
            this.userlist.stopUpdating();
            this.userlist = null;
            this.reset();
            this.userName.hidden = true;
            this.scene.start("SceneOverworld");
            return;
        }
    }
    
}
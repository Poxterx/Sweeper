/**
 * Nombres de los botones
 */
type ReadyButton = "readyOn" | "readyOff" | "changeName" | "back" | "acceptName";

class SceneMultiplayerMenu extends Phaser.Scene {
    /**
     * Texto título menu
     */
    private menu :Phaser.GameObjects.Text;
    //Estado del botón
    private statusReady : boolean;
    //Condición para la posición textbox según si se ha introducido o no el nombre de usuario, así como si se muestra la lista
    private centered : boolean;
    //Caja de texto
    private userName :HTMLTextAreaElement;
    //Canvas del juego, usado para obtener los datos de posición para la caja de texto
    private canvas :HTMLCanvasElement;
    /**
     * Variables en las que se guardaran las imágenes de los botones.
     */
    private ready:Phaser.GameObjects.Image;
    private notready:Phaser.GameObjects.Image;
    private changeName:Phaser.GameObjects.Image;
    private back:Phaser.GameObjects.Image;
    private acceptName:Phaser.GameObjects.Image;
    /**
     * Objeto Text que se utilizara para pintar la lista de usuarios que se envia desde el backend
     */
    private user :Phaser.GameObjects.Text;
    /**
     * Array de strings con los nombres de cada usuario
     */
    private usersArray :string[];

    /**
     * Variables en las que se guardaran el tamaño de la pantalla.
     */
    private sWidth:number;
    private sHeight:number;
    /**
     * Escena que representa el menú del juego
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
        this.ready.setVisible(!status);
        this.notready.setVisible(status);

        this.statusReady = !this.statusReady;
    }

    /**
     * Método que carga la lista de jugadores y los controles pertinentes
     */
    playerReady(){
        //Destruimos el botón de introducir nombre
        this.acceptName.destroy();

        //Vaciamos la caja de texto
        this.userName.value = "";
        //Inicializamos el estado del toggle
        this.statusReady = false;
        //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
        this.centered = false;
        
        //Asignamos el método que llamará el botón Ready
        this.ready = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "readyOn");
        this.ready.setVisible(this.statusReady);
        this.notready = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "readyOff");
        this.ready.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonAnimation(this.statusReady,0.85,0.85) )
        ;
        this.notready.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonAnimation(this.statusReady,0.85,0.85) )
        ;

        //Asignamos el botón que llamará el botón Change Name
        this.changeName = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.35 - this.menu.height * 0.5, "changeName"); 
        this.changeName.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeUserName() )
        ;
    }

    /**
     * Método para cambiar el nombre del jugador
     */
    changeUserName(){


        //Tras gestionar el cambio de nombre se borra el contenido de la caja de texto
        this.userName.value = "";
    }

    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition(){
        //Cuando está en el centro de la pantalla
        if(this.centered){
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - this.menu.width;
            var posY = this.sHeight * 0.5 - this.menu.height * 0.5;
        }
        //Cuando está en la parte superior
        else{
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - this.menu.width;
            var posY = this.sHeight * 0.35 - this.menu.height * 0.5;
        }
        this.userName.style.left = posX + "px";
        this.userName.style.top = posY + "px";
    }

    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Creamos el menú multijugador
        this.menu = this.add.text(0, 0, "Menú Multijugador", {
            fontFamily: "Impact",
            fontSize: 36
        });
        
        //Inicialización del array de la lista de usuarios
        this.usersArray = [];

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
        this.acceptName = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.5 - this.menu.height * 0.5, "acceptName");
        this.back = this.add.image(this.sWidth * 0.5 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "back");

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
                this.scene.start("SceneMenu");
            })
        ;

    }

    update(){
        //Se gestiona la posición d ela caja de texto en caso de redimensionar la pantalla
        this.textBoxPosition();

        //Lista
        if(!this.centered){
            // Se borran los nombres de los usuarios anteriores
            this.usersArray.splice(0,this.usersArray.length);
            // Aqui se rellenaria el array con lo que llega del backend
            
            // De momento le ponemos unos nombres para probar 
            this.usersArray=["manuela420","jorgejavier69","feliciano666","memelord65","tumadreylamiasonamigasseconocen3"];
            // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
            var screen = {
                width: game.config.width as number,
                height: game.config.height as number
            }
            // Posicion vertical de la pantalla en la que ira cada nombre de usuario (inicialmente horizontalmente a un 25% desde arriba)
            let vertPos = 0.4;
            // Cuando esta lleno el array, creamos el texto de cada elemento (nombre)
            for(let element of this.usersArray) {
                this.user = this.add.text(0, 0, element, {
                    fontFamily: "Arial",
                    fontSize: 20
                });
                // Colocamos los nombres verticalmente en el centro, horizontalmente depende del elemento
                this.user.setPosition(
                    screen.width * 0.5 - this.user.width * 0.5,
                    screen.height * vertPos - this.user.height * 0.5
                );
                // Cada elemento se posiciona un poco mas abajo
                vertPos +=0.05;
            }
        }
    }
    
}
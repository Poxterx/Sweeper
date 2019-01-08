/**
 * Botones de connect
 */
type ConnectButton = "connect" | "connectOn";

/**
* Clase contenedora de un lobby
*/
class Lobby  {
    //componentes
    private connect:Phaser.GameObjects.Image;
    private connectOn:Phaser.GameObjects.Image;
    public integrantes : number;
    public Nombre : string;

    constructor() {
        this.Nombre = "Lobby_X";
        this.integrantes = 0;
    }

      //  this.load.image("lobby", "assets/images/Menu_Multi/Multi_Lobby.png");
       // this.load.image("lobby", "assets/images/Menu_Multi/Multi_Lobby.png");

    update(){
        //Actualizar numero


    }
    
    
}
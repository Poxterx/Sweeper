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
    public integrantes :User[];
    public Nombre : string;
    public id :number;

    constructor(name :string, ID :number) {
        this.Nombre = "Lobby_X";
        this.integrantes = [];
        this.id = ID;
    }

    public addUser(user :User) {
        this.integrantes.push(user);
    }

    public deleteUser(user :User) {
        this.integrantes.splice(this.integrantes.indexOf(user));
    }
    
}
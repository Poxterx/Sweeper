/**
 * Botones de connect
 */
type ConnectButton = "connect" | "connectOn";

/**
* Clase contenedora de un lobby
*/
class Lobby  {
    //componentes
    public integrantes :User[];
    public Nombre : string;
    public id :number;

    constructor(name :string, ID :number) {
        this.Nombre = name;
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
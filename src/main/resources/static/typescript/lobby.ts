/**
* Clase contenedora de un lobby
*/
class Lobby  {
    //componentes
    public id : number;
    public integrantes: User[];
    public Nombre : string;

    constructor(name : string, ID : number ) {
        this.Nombre = name;
        this.integrantes = [];
        this.id = ID;
    }

    public addUser(user : User){
        this.integrantes.push(user);
    }

    public deleteUser(){
        
            
        
            
    }
}
    
    

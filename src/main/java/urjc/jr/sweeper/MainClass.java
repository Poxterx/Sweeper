package urjc.jr.sweeper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MainClass 
{
    /**
     * Método principal del programa, que inicia el servidor de Spring Boot.
     * @param args Argumentos del programa
     */
    public static void main(String[] args) {
        // Abrir el servidor y avisar
        SpringApplication.run(MainClass.class, args);
        System.out.println("¡SERVIDOR DE SWEEPER INICIADO! " +
            "Disponible en " + HostManager.getAddress());

        // Crear el archivo host.txt para que el programa implementado en Phaser sepa en qué
        // dirección está alojado el servidor.
        HostManager.createHostFile();
    }
}

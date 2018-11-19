package urjc.jr.sweeper;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

/**
 * Administrador de las direcciones del servidor y del archivo host.txt.
 */
public class HostManager {

    /**
     * Puerto en el que se aloja la aplicación.
     */
    private final static int port = 8080;
    /**
     * Ruta, relativa a la carpeta raíz del proyecto de Java, en la que se almacena el archivo.
     * Debe empezar sin / y terminar por /.
     */
    private final static String path = "src/main/resources/static/";

    /**
     * Devuelve un string que contiene la IP a la que se puede conectar otro dispositivo de la red
     * local, junto al puerto, o la dirección de localhost si no se puede obtener.
     */
    public static String getAddress() {
        // Preparamos la dirección de localhost para devolverla en caso de que haya un error
        String ret = "127.0.0.1";

        try {
            // Primero tenemos que buscar en todas las interfaces de red conectadas a este
            // dispositivo
            Enumeration<NetworkInterface> all = NetworkInterface.getNetworkInterfaces();

            while(all.hasMoreElements()) {
                
                // Cada interfaz de red tiene varias direcciones posibles
                Enumeration<InetAddress> addresses = all.nextElement().getInetAddresses();
                while(addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();

                    // Y algunas direcciones, de hecho, son direcciones locales que el
                    // dispositivo usa para referirse a sí mismo
                    if(!address.isLoopbackAddress() && !address.isLinkLocalAddress()) {

                        // Pero si no es para referirse a sí mismo, entonces la podemos devolver
                        ret = address.getHostAddress();
                    }
                }
                
            }

        } catch(SocketException e) {
            // getNetworkInterfaces() puede lanzar una excepción de este tipo
            System.out.println("Error al obtener la IP del servidor (" + e.getMessage() + ").");
        }

        // Devolvemos la dirección junto al puerto
        return ret + ":" + port;
    }

    /**
     * Genera un archivo en la dirección especificada con el contenido indicado. Se usa
     * para generar el archivo host.txt.
     * @param filename La dirección, basada en la raíz del proyecto, donde generar el archivo
     * (incluyendo el nombre del archivo)
     * @param content El contenido del archivo
     */
    private static void writeFile(String filename, String content) {
        // Si el archivo no existe, hay que crearlo
        File file = new File(filename);
        try {
            if(!file.exists())
                file.createNewFile();
        } catch(IOException e) {
            System.out.println("No se ha podido crear el archivo host (" + e.getMessage() + ").");
        }

        // Cuando el archivo ya está creado, hay que escribir el contenido en él
        try {
            PrintWriter pw = new PrintWriter(filename, "UTF-8");
            pw.print(content);
            pw.close();

        } catch(FileNotFoundException e) {
            // Esto no va a pasar porque el archivo se crea en justo antes de esto
            System.out.println("No se ha podido escribir en el archivo host (" + e.getMessage() + ").");

        } catch(UnsupportedEncodingException e) {
            // Esto tampoco va a pasar porque el charset está hardcoded, pero Java requiere que
            // todas las excepciones se vigilen individualmente
        }
    }

    /**
     * Genera el archivo host.txt en la ruta indicada en la clase HostManager.
     */
    public static void createHostFile() {
        writeFile(path + "host.txt", getAddress());
    }
}
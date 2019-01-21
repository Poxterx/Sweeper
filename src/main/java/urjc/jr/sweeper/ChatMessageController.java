package urjc.jr.sweeper;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class ChatMessageController {

    /**
     * Lista de mensajes de chat almacenados
     */
    private static List<List<ChatMessage>> messages = new ArrayList<>();
    /**
     * Cantidad máxima de mensajes que se almacenarán en el servidor
     */
    private static final int maxMessages = 25;

    /**
     * Devuelve los mensajes almacenados en el servidor
     */
    @GetMapping
    public static Collection<ChatMessage> getMessages() {
        List<ChatMessage> ret = new ArrayList<>();
        for(List<ChatMessage> list : messages) {
            ret.addAll(list);
        }
        return ret;
    }

    @GetMapping("/{lobby}")
    public static Collection<ChatMessage> getMessages(@PathVariable Integer lobby) {
        return messages.get(lobby);
    }

    /**
     * Envía un mensaje al chat del servidor
     * @param msg El mensaje a enviar
     */
    @PostMapping
    public static ChatMessage postMessage(@RequestBody ChatMessage msg) {
        if(msg.getLobby()==null){
            return msg;
        }
        messages.get(msg.getLobby()).add(msg);
        System.out.println("["+msg.getUsername()+"@"+msg.getLobby()+"] " + msg.getContent());

        // Si al recibir este mensaje la lista ya está llena, borramos el mensaje más antiguo
        while(messages.get(msg.getLobby()).size() > maxMessages) {
            messages.get(msg.getLobby()).remove(0);
        }
        
        return msg;
    }

    /**
     * Publica en el chat un mensaje en nombre del servidor.
     * @param content El contenido del mensaje
     */
    public static void postServerMessage(String content, Integer lobby) {
        postMessage(new ChatMessage("{{SERVER}}", content, lobby));
    }

    /**
     * Sincroniza el archivo guardado del chat con los mensajes actuales del chat. Para
     * usar en TaskScheduler.
     */
    public static void updateSavedFile() {
        String path = getChatFilePath();
        File chatFileFolder = new File(path);
        File chatFile = new File(path + "/chat.txt");

        try {
            if(!chatFile.exists()) {
                chatFileFolder.mkdirs();
                chatFile.createNewFile();
            }

            BufferedWriter writer = new BufferedWriter(new FileWriter(chatFile, false));
            for(List<ChatMessage> list : messages) {
                for (ChatMessage msg : list) {
                    writer.write(msg.getUsername() + "§" + msg.getContent() + "§" + msg.getLobby());
                    writer.newLine();
                }
            }
            writer.close();
        } catch(IOException e) {
            System.out.println("No se ha podido guardar el chat ("+e.getMessage()+").");
        }
    }

    /**
     * Carga a la lista de mensajes de esta clase los mensajes guardados en el archivo de chat
     */
    public static void loadMessagesFromFile() {
        for(int i = 0; i < UserController.getLobbiesAmount(); i++) {
            messages.add(new ArrayList<ChatMessage>());
        }

        File chatFile = new File(getChatFilePath() + "/chat.txt");
        
        if(!chatFile.exists()) {
            return;
        }

        try {
            BufferedReader reader = new BufferedReader(new FileReader(chatFile));
            String line = reader.readLine();
            while(line != null) {
                String[] parts = line.split("§");
                if(parts.length != 3) {
                    System.out.println("El chat guardado está en un formato inválido.");
                    break;
                }
                messages.get(Integer.parseInt(parts[2]))
                .add(new ChatMessage(parts[0], parts[1], Integer.parseInt(parts[2])));
                line = reader.readLine();
            }
            reader.close();
        } catch(IOException e) {
            System.out.println("No se ha podido cargar el chat (" + e.getMessage() + ").");
        }
    }

    /**
     * Devuelve la ruta de la carpeta donde se guarda el chat, que es un directorio temporal
     * dependiente del sistema operativo
     */
    private static String getChatFilePath() {
        String ret;
        if(System.getProperty("os.name").toLowerCase().startsWith("windows")) {
            ret = "C:/Temp/SweeperServer";
        } else {
            ret = "/tmp/SweeperServer";
        }
        return ret;
    }
}
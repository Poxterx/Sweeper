package urjc.jr.sweeper;

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
    private static List<ChatMessage> messages = new ArrayList<>();
    /**
     * Cantidad máxima de mensajes que se almacenarán en el servidor
     */
    private static final int maxMessages = 50;

    /**
     * Devuelve los mensajes almacenados en el servidor
     */
    @GetMapping
    public static Collection<ChatMessage> getMessages() {
        return messages;
    }

    /**
     * Envía un mensaje al chat del servidor
     * @param msg El mensaje a enviar
     */
    @PostMapping
    public static ChatMessage postMessage(@RequestBody ChatMessage msg) {
        ChatMessage ret = msg;
        User sender = UserController.getUser(msg.getUserid());

        // Si el mensaje no tiene autor (porque el id recibido no corresponde a un usuario conectado),
        // eso significa que este mensaje no es válido y se puede ignorar sin avisar.

        if(sender != null) {
            // En caso de que sí sea válido, lo añadimos a la lista de mensajes
            messages.add(msg);
            System.out.println("[" + sender.getUsername() + "] " + msg.getContent());
            // El usuario que ha enviado el mensaje sigue activo
            sender.resetIdle();
        } else {
            ret = null;
        }

        // Si al recibir este mensaje la lista ya está llena, borramos el mensaje más antiguo
        while(messages.size() > maxMessages) {
            messages.remove(0);
        }
        
        return ret;
    }

}
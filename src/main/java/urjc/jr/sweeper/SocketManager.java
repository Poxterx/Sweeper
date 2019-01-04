package urjc.jr.sweeper;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import urjc.jr.sweeper.HostManager;

/**
 * Administrador de WebSockets
 */
public class SocketManager extends TextWebSocketHandler {

    /**
     * Mapeador que permite interpretar los datos en formato JSON.
     */
    private static ObjectMapper mapper = new ObjectMapper();
    /**
     * Lista de sesiones de WebSocket abiertas en este momento. Para usar con operaciones
     * que requieran enviar un mensaje a todos los clientes conectados.
     */
    private List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    /**
     * Función que administra todos los mensajes de los clientes recibidos mediante WebSocket
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String hostname = session.getRemoteAddress().getHostName();
        JsonNode node = mapper.readTree(message.getPayload());
        String operation = node.get("operation").asText();
        JsonNode value = node.get("value");

        switch(operation) {
            // Operación que permite relacionar a cada cliente con el usuario que usa. Esta
            // operación debe usarse inmediatamente al establecer la conexión.
            case "LINK_USER":
                try {
                    HostManager.clients.put(hostname, UUID.fromString(value.asText()));
                } catch(IllegalArgumentException e) {
                    System.out.println("El UUID recibido de " + hostname + " no es válido.");
                }
                break;
            // En caso de que se reciba una operación que no está descrita aquí:
            default:
                System.out.println("La operación \"" + operation + "\" recibida de "
                + hostname + " no está soportada.");
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String hostname = session.getRemoteAddress().getHostName();
        sessions.add(session);
        System.out.println("Se ha establecido la conexión con " + hostname);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus code) throws Exception {
        String hostname = session.getRemoteAddress().getHostName();
        sessions.remove(session);
        UserController.removeUser(HostManager.clients.get(hostname));
        HostManager.clients.remove(hostname);
        System.out.println("Se ha cerrado la conexión con " + hostname
        + " -- Código de cierre " + code.getCode());
        // El código de cierre indica el motivo por el que se ha cerrado el WebSocket.
        // El código ideal es 1000, que significa que se ha cerrado voluntariamente. Otro código
        // a destacar que no debe causar preocupaciones es 1001, que significa que se ha caído la
        // conexión, o el cliente ha cerrado su pestaña del juego.
    }
}
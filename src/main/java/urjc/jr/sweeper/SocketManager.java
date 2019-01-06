package urjc.jr.sweeper;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Administrador de WebSockets
 */
class SocketManager extends TextWebSocketHandler {

    private class SessionData {
        private WebSocketSession session;
        private UUID userId;
        private String hostname;
        public SessionData(WebSocketSession session) {
            this.session = session;
            this.hostname = session.getRemoteAddress().getHostName();
        }
        public WebSocketSession getSession() {return this.session;}
        public String getHostname() {return this.hostname;}
        public UUID getUserId() {return this.userId;}
        public void setUserId(UUID newId) {this.userId = newId;}
    }

    private static Map<String, SessionData> sessions = new ConcurrentHashMap<>();

    /**
     * Mapeador que permite interpretar los datos en formato JSON.
     */
    private static ObjectMapper mapper = new ObjectMapper();

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
                    sessions.get(session.getId()).setUserId(UUID.fromString(value.asText()));
                } catch(IllegalArgumentException e) {
                    System.out.println("El UUID recibido de " + hostname + " no es válido.");
                }
                break;
            case "SYNC_DATA":
                broadcastTextMessage(syncData(session, mapper.readTree(value.asText())));
                break;
            // En caso de que se reciba una operación que no está descrita aquí:
            default:
                System.out.println("La operación \"" + operation + "\" recibida de "
                + hostname + " no está soportada.");
        }
    }

    private void broadcastTextMessage(String message) throws Exception {
        for(String sessionId : sessions.keySet()) {
            WebSocketSession session = sessions.get(sessionId).getSession();
            synchronized(session) {
                session.sendMessage(new TextMessage(message));
            }
        }
    }

    private String syncData(WebSocketSession session, JsonNode data) throws Exception {
        ObjectNode reponse = mapper.createObjectNode();
        ObjectNode value = mapper.createObjectNode();
        reponse.put("operation", "SYNC_DATA");
        String[] textKeys = new String[]{"uuid", "mode", "anim"};
        String[] intKeys = new String[]{"posX", "posY", "frame", "life"};
        String[] boolKeys = new String[]{"flip"};
        for(String k : textKeys) {
            value.put(k, data.get(k).asText());    
        }
        for(String k : intKeys) {
            value.put(k, data.get(k).asInt());
        }
        for(String k : boolKeys) {
            value.put(k, data.get(k).asBoolean());
        }
        reponse.put("value", value.toString());
        return reponse.toString();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String hostname = session.getRemoteAddress().getHostName();
        sessions.put(session.getId(), new SessionData(session));
        System.out.println("Se ha establecido la conexión con " + hostname);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus code) throws Exception {
        String hostname = session.getRemoteAddress().getHostName();
        UserController.removeUser(sessions.get(session.getId()).getUserId());
        sessions.remove(session.getId());
        System.out.println("Se ha cerrado la conexión con " + hostname
        + " -- Código de cierre " + code.getCode());
        // El código de cierre indica el motivo por el que se ha cerrado el WebSocket.
        // El código ideal es 1000, que significa que se ha cerrado voluntariamente. Otro código
        // a destacar que no debe causar preocupaciones es 1001, que significa que se ha caído la
        // conexión, o el cliente ha cerrado su pestaña del juego.
    }

    public static Set<String> getConnectedClients() {
        Set<String> clients = new HashSet<>();
        for(String sessionId : sessions.keySet()) {
            clients.add(sessions.get(sessionId).getHostname());
        }
        return clients;
    }
}
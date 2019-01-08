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
                    if(UserController.getModId() == null) {
                        UserController.setModId(UUID.fromString(value.asText()));
                    }
                } catch(IllegalArgumentException e) {
                    System.out.println("El UUID recibido de " + hostname + " no es válido.");
                }
                break;
            case "SYNC_PLAYER":
            case "SYNC_NPC":
                broadcastTextMessage(syncData(session, operation, mapper.readTree(value.asText())));
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

    private String syncData(WebSocketSession session, String operation, JsonNode data) throws Exception {
        ObjectNode reponse = mapper.createObjectNode();
        reponse.put("operation", operation);
        reponse.put("value", data.toString());
        return reponse.toString();
    }

    public static void notifyMod(UUID id) throws Exception {
        ObjectNode notification = mapper.createObjectNode();
        notification.put("operation", "SET_MOD");
        notification.put("value", "");

        WebSocketSession session = null;
        for(String key : sessions.keySet()) {
            if(sessions.get(key).getUserId().equals(id)) {
                session = sessions.get(key).getSession();
            }
        }

        if(session != null) {
            synchronized(session) {
                session.sendMessage(new TextMessage(notification.toString()));
            }
            System.out.println("El moderador es " + 
            UserController.getUser(sessions.get(session.getId()).getUserId()).getName());
        }   
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
        boolean needNewMod = false;
        if(sessions.size() <= 1) {
            UserController.setModId(null);
        } else if(UserController.isModId(sessions.get(session.getId()).getUserId())) {
           needNewMod = true;
        }
        UserController.removeUser(sessions.get(session.getId()).getUserId());
        sessions.remove(session.getId());
        if(needNewMod) {
            UserController.pickRandomMod();
        }
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
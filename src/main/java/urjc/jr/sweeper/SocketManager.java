package urjc.jr.sweeper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
        WebSocketSession session;
        UUID userId;
        String hostname;
        Integer lobby;

        SessionData(WebSocketSession session) {
            this.session = session;
            this.hostname = session.getRemoteAddress().getHostName();
        }

        User getUser() {
            return userId == null ? null : UserController.getUser(userId);
        }
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
        Integer lobby = sessionData(session).lobby;
        JsonNode node = mapper.readTree(message.getPayload());
        String operation = node.get("operation").asText();
        JsonNode value = node.get("value");
        User user = sessionData(session).getUser();
        ObjectNode reponse = null;

        switch(operation) {
            // Operación que permite relacionar a cada cliente con el usuario que usa. Esta
            // operación debe usarse inmediatamente al establecer la conexión.
            case "LINK_USER":
                try {
                    sessionData(session).userId = UUID.fromString(value.asText());
                } catch(IllegalArgumentException e) {
                    System.out.println("El UUID recibido de " + hostname + " no es válido.");
                }
                break;
            case "SYNC_PLAYER":
            case "SYNC_NPC":
                broadcastTextMessage(
                    writeOperation(operation, mapper.readTree(value.asText())),
                    sessionData(session).lobby
                );
                break;
            case "ENTER_LOBBY":
                sessionData(session).lobby = value.asInt();
                sessionData(session).getUser().setLobby(value.asInt());
                ChatMessageController.postServerMessage(user.getName() + " se ha conectado.",
                sessionData(session).lobby);
                if(UserController.getModId(value.asInt()) == null) {
                    UserController.setModId(sessionData(session).userId, value.asInt());
                }
                break;
            case "EXIT_LOBBY":
                sessionData(session).lobby = null;
                ChatMessageController.postServerMessage(user.getName() + " se ha desconectado.",
                lobby);
                if(UserController.getModId(lobby).equals(sessionData(session).userId)) {
                    if(getUsersInLobby(lobby).size() > 0) {
                        UserController.pickRandomMod(lobby);
                    } else {
                        UserController.setModId(null, lobby);
                    }
                }
                break;
            case "GET_USERS_IN_LOBBY":
                reponse = mapper.createObjectNode();
                reponse.put("operation", "READ_USERS_IN_LOBBY");
                reponse.put("value", getUsersInLobby(lobby).toArray().toString());
                session.sendMessage(new TextMessage(reponse.toString()));
                break;
            case "LOBBY_START":
                reponse = mapper.createObjectNode();
                reponse.put("operation", "START_GAME");
                reponse.put("value", "");
                broadcastTextMessage(reponse.toString(), lobby);
                UserController.setLobbyPlaying(lobby, true);
                break;
            case "LOBBY_WIN":
                reponse = mapper.createObjectNode();
                reponse.put("operation", "LOBBY_WIN");
                reponse.put("value", "");
                broadcastTextMessage(reponse.toString(), lobby);
                UserController.setLobbyPlaying(lobby, true);
                break;
            case "LEVER_INTERACT":
                reponse = mapper.createObjectNode();
                reponse.put("operation", "LEVER_INTERACT");
                reponse.put("value", "");
                broadcastTextMessage(reponse.toString(), lobby);
                UserController.setLobbyPlaying(lobby, true);
                break;
            // En caso de que se reciba una operación que no está descrita aquí:
            default:
                System.out.println("La operación \"" + operation + "\" recibida de "
                + hostname + " no está soportada.");
        }
    }

    private void broadcastTextMessage(String message, Integer lobby) throws Exception {
        try {
            for(String sessionId : sessions.keySet()) {
                WebSocketSession session = sessions.get(sessionId).session;
                if(lobby != null && sessions.get(sessionId).lobby.equals(lobby))
                synchronized(session) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch(Exception e) {

        }
    }

    public static List<UUID> getUsersInLobby(Integer lobby) {
        if(lobby == null) {
            return null;
        }

        List<UUID> ret = new ArrayList<>();
        for(SessionData session : sessions.values()) {
            if(session.lobby != null && session.lobby.equals(lobby)) {
                ret.add(session.userId);
            }
        }

        return ret;
    }

    private String writeOperation(String operation, JsonNode data) throws Exception {
        ObjectNode reponse = mapper.createObjectNode();
        reponse.put("operation", operation);
        reponse.put("value", data.toString());
        return reponse.toString();
    }

    public static void notifyMod(UUID id, Integer lobby) throws Exception {
        ObjectNode notification = mapper.createObjectNode();
        notification.put("operation", "SET_MOD");
        notification.put("value", "");

        WebSocketSession session = null;
        for(String key : sessions.keySet()) {
            if(sessions.get(key).userId.equals(id)) {
                session = sessions.get(key).session;
            }
        }

        if(session != null) {
            synchronized(session) {
                session.sendMessage(new TextMessage(notification.toString()));
            }
            String lobbySpecification = "";
            if(lobby != null) {
                lobbySpecification = "del lobby " + lobby;
            }
            System.out.println("El moderador " + lobbySpecification + " es " + 
            sessionData(session).getUser().getName());
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
        String hostname = sessionData(session).hostname;
        boolean needNewMod = false;
        User user = sessionData(session).getUser();
        Integer lobby = sessionData(session).lobby;
        if(lobby != null){
            if(getUsersInLobby(lobby).size() <= 1) {
                UserController.setModId(null, lobby);
                UserController.setLobbyPlaying(lobby, false);
            } else if(UserController.isModId(sessionData(session).userId, lobby)) {
               needNewMod = true;
            }
        }
        UserController.removeUser(sessionData(session).userId);
        sessions.remove(session.getId());
        if(needNewMod) {
            UserController.pickRandomMod(lobby);
        }
        ChatMessageController.postServerMessage(user.getName() + " se ha desconectado.",
        lobby);
        
        
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
            clients.add(sessions.get(sessionId).hostname);
        }
        return clients;
    }

    private static SessionData sessionData(WebSocketSession session) {
        return sessions.get(session.getId());
    }
}
package urjc.jr.sweeper;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;

import javax.servlet.http.HttpServletRequest;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    public static class UserCreationReponse {
        private UUID id;
        private String nameStatus;

        public UserCreationReponse(UUID uuid, String nameStatus) {
            this.id = uuid;
            this.nameStatus = nameStatus;
        }

        public UserCreationReponse() {}
        public UUID getId() {return id;}
        public String getNameStatus() {return nameStatus;}
        public void setId(UUID id) {this.id = id;}
        public void setNameStatus(String name) {this.nameStatus = name;}
    }

    private static Map<UUID, User> users = new ConcurrentHashMap<>();
    private static Set<String> takenUsernames = new ConcurrentSkipListSet<>();

    private static final int maxUsernameCharacters = 12;

    @GetMapping
    public static Collection<User> getUsers() {
        return users.values();
    }
    
    @GetMapping("/{uuid}")
    public static User getUser(@PathVariable UUID uuid) {
        User ret = users.get(uuid);
        return ret;
    }

    @PostMapping
    public static UserCreationReponse addUser(@RequestBody String name, HttpServletRequest request) {
        User user = new User();
        String usernameStatus = setUsername(user, name);
        if(usernameStatus.equals("OK")) {
            user.setId(UUID.randomUUID());
            users.put(user.getId(), user);
            takenUsernames.add(name);
            ChatMessageController.postServerMessage(user.getName() + " se ha conectado.");
        }
        
        return new UserCreationReponse(user.getId(), usernameStatus);
    }

    private static String setUsername(User user, String name) {
        if(user == null) {
            return null;
        }
        
        String ret;
        
        name = name.trim();
        if(name == null || name.isEmpty()) {
            ret = "EMPTY";
        } else if(name.length() > maxUsernameCharacters) {
            ret = "TOOLONG";
        } else if(user.getName() != null && user.getName().equals(name)) {
            ret = "SAME";
        } else if(takenUsernames.contains(name)) {
            ret = "TAKEN";
        } else {
            String oldName = user.getName();
            user.setName(name);
            takenUsernames.add(name);
            if(oldName != null && takenUsernames.contains(oldName)) {
                takenUsernames.remove(oldName);
            }
            ret = "OK";
        }

        return ret;
    }

    @PostMapping("/{uuid}/username")
    public static String changeUsername(@PathVariable UUID uuid, @RequestBody String name) {
        User user = users.get(uuid);
        if(user == null) {
            return null;
        }
        String oldName = user.getName();
        String ret = setUsername(user, name);
        if(ret.equals("OK")) {
            ChatMessageController.postServerMessage(oldName + " se ha cambiado el nombre a " + name);
        } else {
            ChatMessageController.postServerMessage(oldName + " ha intentado cambiarse el nombre a \"" + name
            + "\", pero no ha podido. Error: " + ret);
        }

        return ret;
    }

    @PostMapping("/{uuid}/ready")
    public static User setReadyState(@PathVariable UUID uuid, @RequestBody String ready) {
        User currentUser = users.get(uuid);
        if(currentUser != null) {
            currentUser.setReady(Boolean.parseBoolean(ready));
            String word = currentUser.isReady()? " ya " : " no ";
            ChatMessageController.postServerMessage(currentUser.getName() + word + "está listo.");
        }
        return currentUser;
    }

    public static void removeUser(User user) {
        users.remove(user.getId());
        takenUsernames.remove(user.getName());
        ChatMessageController.postServerMessage(user.getName() +  " se ha desconectado.");
    }

    public static void removeUser(UUID uuid) {
        removeUser(users.get(uuid));
    }
}
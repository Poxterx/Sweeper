package urjc.jr.sweeper;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;

import java.util.List;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private static UUID[] mods;

    private static Random random = new Random();

    public static class UserCreationReponse {
        private UUID id;
        private String status;

        public UserCreationReponse(UUID uuid, String nameStatus) {
            this.id = uuid;
            this.status = nameStatus;
        }

        public UserCreationReponse() {}
        public UUID getId() {return id;}
        public String getStatus() {return status;}
        public void setId(UUID id) {this.id = id;}
        public void setStatus(String name) {this.status = name;}
    }

    private static Map<UUID, User> users = new ConcurrentHashMap<>();

    private static Map<String, String> passwords = new ConcurrentHashMap<>();

    private static Set<String> takenUsernames = new ConcurrentSkipListSet<>();

    private static final int maxUsernameCharacters = 12;

    private static final int maxLobbies = 4;

    private static final int maxPlayersPerLobby = 4;

    private static boolean[] lobbiesPlaying;

    @GetMapping
    public static Collection<User> getUsers() {
        return users.values();
    }

    @GetMapping("/uuid")
    public static Collection<UUID> getUsersId() {
        return users.keySet();
    }

    @GetMapping("/uuid/{lobby}")
    public static Collection<UUID> getUsersIdFromLobby(@PathVariable Integer lobby) {
        return SocketManager.getUsersInLobby(lobby);
    }

    @GetMapping("/lobbies")
    public static int getLobbiesAmount() {
        return maxLobbies;
    }

    @GetMapping("/lobbies/{lobby}")
    public static String getLobbyStatus(@PathVariable Integer lobby) {
        if(lobbiesPlaying == null) {
            lobbiesPlaying = new boolean[maxLobbies];
        }

        String ret;
        if(SocketManager.getUsersInLobby(lobby).size() >= maxPlayersPerLobby) {
            ret = "FULL";
        } else if(lobbiesPlaying[lobby] && SocketManager.getUsersInLobby(lobby).size() > 0) {
            ret = "PLAYING";
        } else {
            ret = "OK";
        }

        return ret;
    }

    public static void setLobbyPlaying(Integer lobby, boolean playing) {
        if(lobby == null) {
            return;
        }

        if(lobbiesPlaying == null) {
            lobbiesPlaying = new boolean[maxLobbies];
        }

        lobbiesPlaying[lobby] = playing;
    }
    
    @GetMapping("/playersperlobby")
    public static int getPlayersPerLobby() {
        return maxPlayersPerLobby;
    }


    @GetMapping("/{uuid}")
    public static User getUser(@PathVariable UUID uuid) {
        User ret = users.get(uuid);
        return ret;
    }

    @PostMapping
    public static UserCreationReponse loginUser(@RequestBody User user) {
        UserCreationReponse ret = new UserCreationReponse();
        if(!passwords.containsKey(user.getName())) {
            ret.status = "NONEXISTENT";
        } else if(!passwords.get(user.getName()).equals(user.getPassword())) {
            ret.status = "WRONGPASS";
        } else if(takenUsernames.contains(user.getName())) {
            ret.status = "INSERVER";    
        } else {
            ret.status = "OK";
        }

        if(ret.status.equals("OK")) {
            ret.id = addUser(user);
        }

        return ret;
    }

    @PostMapping("/register")
    public static UserCreationReponse registerUser(@RequestBody User user) {
        String usernameStatus = checkUsername(user.getName());
        UserCreationReponse ret = new UserCreationReponse();
        ret.status = usernameStatus;
        if(usernameStatus.equals("OK")) {
            ret.id = addUser(user);
            passwords.put(user.getName(), user.getPassword());
            updateRegisteredUsers();
        }
        return ret;
    }

    private static String checkUsername(String name) {
        String ret;
        name = name.trim();

        if(name == null || name.isEmpty()) {
            ret = "EMPTY";
        } else if(name.length() > maxUsernameCharacters) {
            ret = "TOOLONG";
        } else if(name.contains("§")) {
            ret = "INVALID";
        } else if(passwords.containsKey(name)) {
            ret = "TAKEN";
        } else {
            ret = "OK";
        }

        return ret;
    }

    private static UUID addUser(User user) {
        user.setId(UUID.randomUUID());
        users.put(user.getId(), user);
        takenUsernames.add(user.getName());

        return user.getId();
    }

    @PostMapping("/{uuid}/ready")
    public static User setReadyState(@PathVariable UUID uuid, @RequestBody String ready) {
        User currentUser = users.get(uuid);
        if(currentUser != null) {
            currentUser.setReady(Boolean.parseBoolean(ready));
            String word = currentUser.isReady()? " ya " : " no ";
            ChatMessageController.postServerMessage(currentUser.getName() + word + "está listo.",
            currentUser.getLobby());
        }
        return currentUser;
    }

    public static void removeUser(User user) {
        if(user == null) {
            return;
        }

        users.remove(user.getId());
        takenUsernames.remove(user.getName());
    }

    public static void removeUser(UUID uuid) {
        removeUser(users.get(uuid));
    }

    public static UUID getModId(Integer lobby) {
        if(mods == null) {
            mods = new UUID[maxLobbies];
        }
        return lobby == null? null : mods[lobby];
    }

    public static void setModId(UUID id, Integer lobby) {
        if(mods == null) {
            mods = new UUID[maxLobbies];
        }
        if(lobby != null) {
            mods[lobby] = id;
        }
        try {
            SocketManager.notifyMod(id, lobby);
        } catch(Exception e) {
            System.out.println("El servidor ha elegido a un moderador pero no se lo ha podido notificar");
        }
    }

    public static boolean isModId(UUID id, Integer lobby) {
        return lobby == null ? null : mods[lobby].toString().equals(id.toString());
    }

    public static void pickRandomMod(Integer lobby) {
        if(lobby == null) {
            return;
        }

        List<UUID> keys = new ArrayList<>(SocketManager.getUsersInLobby(lobby));
        int chosen = random.nextInt(Math.max(keys.size(), 1));
        for(int i = 0; i < keys.size(); i++) {
            if(chosen == i) {
                mods[lobby] = keys.get(i);
            }
        }
        try {
            SocketManager.notifyMod(mods[lobby], lobby);
        } catch(Exception e) {
            System.out.println("El servidor ha elegido a un moderador pero no se lo ha podido notificar: "
            + e.getClass().getName() + ", " + e.getMessage());
        }
    }

    public static void updateRegisteredUsers() {
        String path = getUsersFilePath();
        File usersFileFolder = new File(path);
        File usersFile = new File(path + "/users.txt");

        try {
            if(!usersFile.exists()) {
                usersFileFolder.mkdirs();
                usersFile.createNewFile();
            }

            BufferedWriter writer = new BufferedWriter(new FileWriter(usersFile, false));
            for(String username : passwords.keySet()) {
                writer.write(username + "§" + passwords.get(username));
                writer.newLine();
            }
            writer.close();
        } catch(IOException e) {
            System.out.println("No se ha podido guardar el registro de usuarios ("+e.getMessage()+").");
        }
    }

    public static void loadRegisteredUsers() {
        File usersFile = new File(getUsersFilePath() + "/users.txt");
        
        if(!usersFile.exists()) {
            return;
        }

        try {
            BufferedReader reader = new BufferedReader(new FileReader(usersFile));
            String line = reader.readLine();
            while(line != null) {
                String[] parts = line.split("§");
                if(parts.length != 2) {
                    System.out.println("El registro de usuarios está en un formato inválido.");
                    break;
                }
                passwords.put(parts[0], parts[1]);
                line = reader.readLine();
            }
            reader.close();
        } catch(IOException e) {
            System.out.println("No se ha podido el registro de usuarios (" + e.getMessage() + ").");
        }
    }

    private static String getUsersFilePath() {
        String ret;
        if(System.getProperty("os.name").toLowerCase().startsWith("windows")) {
            ret = System.getProperty("user.home") + "/AppData/Roaming/.sweeperserver";
        } else {
            ret = System.getProperty("user.home") + "/.sweeperserver";
        }
        return ret;
    }
}
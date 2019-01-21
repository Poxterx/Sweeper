type NpcSyncExchangeData = {
    id :string,
    data :any
}

interface INpcSyncable {
    sendData() :any;
    receiveData(data :any) :void;
}

class NpcSync {

    private static map :Map<string, INpcSyncable>;

    private static interval :integer;

    private static active :boolean;

    private static initialized :boolean;

    public static register(id :string, npc :INpcSyncable) {
        if(!NpcSync.initialized) {
            NpcSync.initialize();
        }
        
        NpcSync.map.set(id, npc);
        if(npc instanceof Entity){
            npc.preventDeath=true;
        }
    }

    public static unregister(npc :INpcSyncable) {
        if(!NpcSync.initialized) {
            return;
        }
        for(let mapEntry of NpcSync.map.entries()) {
            if(mapEntry[1] == npc) {
                NpcSync.map.delete(mapEntry[0]);
            }
        }
        if(npc instanceof Entity){
            npc.preventDeath=false;
        }
    }

    public static isRegistered(npc :any) {
        if(!NpcSync.initialized) {
            return false;
        }
        var ret = false;
        for(let value of NpcSync.map.values()) {
            if(value == npc) {
                ret = true;
                break;
            }
        }
        return ret;
    }

    private static initialize() {
        if(!NpcSync.map) {
            NpcSync.map = new Map<string, INpcSyncable>();
        }

        NpcSync.initialized = true;
    }

    private static sendData() {
        var value :NpcSyncExchangeData[] = [];

        for(let mapEntry of NpcSync.map.entries()) {
            value.push({
                id: mapEntry[0],
                data: mapEntry[1].sendData()
            });
        }

        Connection.sendOperation("SYNC_NPC", value);
    }

    public static receiveData(value :NpcSyncExchangeData[]) {
        if(NpcSync.active || !NpcSync.initialized) {
            return;
        }

        for(let v of value) {
            var npc = NpcSync.map.get(v.id);
            if(npc)
                npc.receiveData(v.data);
        }
    }

    public static activate() {
        if(!NpcSync.initialized) {
            NpcSync.initialize();
        }
        NpcSync.deactivate();
        NpcSync.interval = setInterval(NpcSync.sendData, 50);
        NpcSync.active = true;
    }

    public static deactivate() {
        clearInterval(NpcSync.interval);
        NpcSync.active = false;
        for(let value of NpcSync.map.values()){
            NpcSync.unregister(value);
        }
    }

    public static isActive() {
        return NpcSync.active;
    }
}
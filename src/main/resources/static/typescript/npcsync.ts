type NpcSyncExchangeData = {
    id :integer,
    data :any
}

interface INpcSyncable {
    sendData() :any;
    receiveData(data :any) :void;
}

class NpcSync {

    private static map :Map<integer, INpcSyncable>;

    private static nextId :integer;

    private static interval :integer;

    private static active :boolean;

    private static initialized :boolean;

    public static register(npc :INpcSyncable) {
        if(!NpcSync.initialized) {
            NpcSync.initialize();
        }
        var id = NpcSync.nextId++;
        NpcSync.map.set(id, npc);
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
            NpcSync.map = new Map<integer, INpcSyncable>();
        }

        if(NpcSync.nextId == null) {
            NpcSync.nextId = 0;
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
        NpcSync.interval = setInterval(NpcSync.sendData, 50);
        NpcSync.active = true;
    }

    public static deactivate() {
        clearInterval(NpcSync.interval);
        NpcSync.active = false;
    }

    public static isActive() {
        return NpcSync.active;
    }
}
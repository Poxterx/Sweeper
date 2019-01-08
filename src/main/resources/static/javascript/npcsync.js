class NpcSync {
    static register(npc) {
        if (!NpcSync.initialized) {
            NpcSync.initialize();
        }
        var id = NpcSync.nextId++;
        NpcSync.map.set(id, npc);
    }
    static unregister(npc) {
        if (!NpcSync.initialized) {
            return;
        }
        for (let mapEntry of NpcSync.map.entries()) {
            if (mapEntry[1] == npc) {
                NpcSync.map.delete(mapEntry[0]);
            }
        }
    }
    static isRegistered(npc) {
        if (!NpcSync.initialized) {
            return false;
        }
        var ret = false;
        for (let value of NpcSync.map.values()) {
            if (value == npc) {
                ret = true;
                break;
            }
        }
        return ret;
    }
    static initialize() {
        if (!NpcSync.map) {
            NpcSync.map = new Map();
        }
        if (NpcSync.nextId == null) {
            NpcSync.nextId = 0;
        }
        NpcSync.initialized = true;
    }
    static sendData() {
        var value = [];
        for (let mapEntry of NpcSync.map.entries()) {
            value.push({
                id: mapEntry[0],
                data: mapEntry[1].sendData()
            });
        }
        Connection.sendOperation("SYNC_NPC", value);
    }
    static receiveData(value) {
        if (NpcSync.active || !NpcSync.initialized) {
            return;
        }
        for (let v of value) {
            var npc = NpcSync.map.get(v.id);
            if (npc)
                npc.receiveData(v.data);
        }
    }
    static activate() {
        if (!NpcSync.initialized) {
            NpcSync.initialize();
        }
        NpcSync.interval = setInterval(NpcSync.sendData, 50);
        NpcSync.active = true;
    }
    static deactivate() {
        clearInterval(NpcSync.interval);
        NpcSync.active = false;
    }
    static isActive() {
        return NpcSync.active;
    }
}
//# sourceMappingURL=npcsync.js.map
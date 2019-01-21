class NpcSync {
    static register(id, npc) {
        if (!NpcSync.initialized) {
            NpcSync.initialize();
        }
        NpcSync.map.set(id, npc);
        if (npc instanceof Entity) {
            npc.preventDeath = true;
        }
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
        if (npc instanceof Entity) {
            npc.preventDeath = false;
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
        NpcSync.deactivate();
        NpcSync.interval = setInterval(NpcSync.sendData, 50);
        NpcSync.active = true;
    }
    static deactivate() {
        clearInterval(NpcSync.interval);
        NpcSync.active = false;
        for (let value of NpcSync.map.values()) {
            NpcSync.unregister(value);
        }
    }
    static isActive() {
        return NpcSync.active;
    }
}
//# sourceMappingURL=npcsync.js.map
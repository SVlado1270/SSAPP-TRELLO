import DSUStorage from "/webcardinal/base/libs/DSUStorage.js";

class DoneManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    removeDone(DonePath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "DoneSwarm", "removeDone", DonePath).onReturn(callback);
    }

    editDone(Done, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "DoneSwarm", "editDone", Done).onReturn(callback);
    }

    listDones(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "DoneSwarm", "listDones").onReturn(callback);
    }
}

let doneManagerService = new DoneManagerService();
let getDoneManagerServiceInstance = function () {
    return doneManagerService;
}

export {
    getDoneManagerServiceInstance
};
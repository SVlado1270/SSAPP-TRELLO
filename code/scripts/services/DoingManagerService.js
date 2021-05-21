import DSUStorage from "/webcardinal/base/libs/DSUStorage.js";

class DoingManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }


    removeDoing(doingPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "doingSwarm", "removeDoing", doingPath).onReturn(callback);
    }

    editDoing(doing, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "doingSwarm", "editDoing", doing).onReturn(callback);
    }

    listDoings(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "doingSwarm", "listDoings").onReturn(callback);
    }
}

let doingManagerService = new DoingManagerService();
let getDoingManagerServiceInstance = function () {
    return doingManagerService;
}

export {
    getDoingManagerServiceInstance
};
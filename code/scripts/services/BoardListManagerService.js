import DSUStorage from "/webcardinal/base/libs/DSUStorage.js";

class BoardListManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    // BOARD
    // createBoard(board, callback) {
    //     $$.interaction.startSwarmAs("test/agent/007", "boardSwarm", "createBoard", board).onReturn(callback);
    // }

    createBoard(path, boardName, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "attachDossier", "newDossier", path, boardName).onReturn(callback);
    }

    importBoard(path, boardName, seed, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "attachDossier", "fromSeed", path, boardName, seed).onReturn(callback);
    }

    removeBoard(path, boardName, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "delete", "dossier", path, boardName).onReturn(callback);
    }

    shareBoard(path, boardName, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "listDossiers", "printSeed", path, boardName).onReturn(callback);
    }

    listBoards(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "boardSwarm", "listBoards").onReturn(callback);
    }
}

let boardListManagerService = new BoardListManagerService();
let getBoardListManagerServiceInstance = function () {
    return boardListManagerService;
}

export {
    getBoardListManagerServiceInstance
};
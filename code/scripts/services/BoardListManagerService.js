import DSUStorage from "/webcardinal/base/libs/DSUStorage.js";

class BoardListManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    // BOARD
    createBoard(board, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "boardSwarm", "createBoard", board).onReturn(callback);
    }

    removeBoard(boardPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "boardSwarm", "removeBoard", boardPath).onReturn(callback);
    }

    editBoard(board, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "boardSwarm", "editBoard", board).onReturn(callback);
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
import DSUStorage from "/webcardinal/base/libs/DSUStorage.js";

class BoardManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    createToDo(todo, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "createToDo", todo).onReturn(callback);
    }

    removeToDo(todoPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "removeItem", todoPath).onReturn(callback);
    }

    editToDo(todo, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "editToDo", todo).onReturn(callback);
    }

    listToDos(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "listToDos").onReturn(callback);
    }

    // DOING
    createDoing(doing, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "createDoing", doing).onReturn(callback);
    }

    removeDoing(doingPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "removeItem", doingPath).onReturn(callback);
    }

    editDoing(doing, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "editDoing", doing).onReturn(callback);
    }

    listDoings(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "listDoings").onReturn(callback);
    }

    // DONE
    createDone(done, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "createDone", done).onReturn(callback);
    }

    removeDone(donePath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "removeItem", donePath).onReturn(callback);
    }

    editDone(done, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "editDone", done).onReturn(callback);
    }

    listDone(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "listDone").onReturn(callback);
    }
    
    // BOARD
    createBoard(board, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "createBoard", board).onReturn(callback);
    }

    removeBoard(boardPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "removeBoard", boardPath).onReturn(callback);
    }

    editBoard(board, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "editBoard", board).onReturn(callback);
    }

    listBoards(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "itemSwarm", "listBoards").onReturn(callback);
    }
}

let boardManagerService = new BoardManagerService();
let getBoardManagerServiceInstance = function () {
    return boardManagerService;
}

export {
    getBoardManagerServiceInstance
};
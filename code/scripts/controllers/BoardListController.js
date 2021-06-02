import { getBoardListManagerServiceInstance } from "../services/BoardListManagerService.js";

const { Controller } = WebCardinal.controllers;

export default class BoardsListController extends Controller {
    constructor(...props) {
        super(...props);

        this.BoardListManagerService = getBoardListManagerServiceInstance();

        // Set some default values for the view model
        this.model = {
            boards: [],
            board: {
                id: 'board',
                name: 'board',
                value: '',
                placeholder: 'Add board title'
            },
            importedBoard: {
                id: 'board',
                name: 'board',
                value: '',
                placeholder: 'Import board',
                seed: ''
            },
            'no-data': 'There are no boards'
        };

        // Init the listeners to handle events
        this.initListeners();

        // Populate existing boards to board list
        this.populateBoardList((err, data) => {
            if (err) {
                return console.log(err);
            }
            this.setBoardsClean(data);
        });
    }

    initListeners = () => {
        // Select the creating field and add
        // focusout event listener
        // This is used for creating new board elements
        const boardCreatorElement = this.getElementByTag('create-board');
        if (boardCreatorElement) {
            boardCreatorElement.addEventListener("focusout", this._mainInputBlurHandler);
        }

        const boardImportedElement = this.getElementByTag('import-board');
        if (boardImportedElement) {
            boardImportedElement.addEventListener("click", this.importBoard);
        }

        // Selecting the parent of all the boards and add the event listeners
        const boardsElement = this.getElementByTag('boards');
        if (boardsElement) {
            boardsElement.addEventListener("click", this._changeBoardCheckedState)
            boardsElement.addEventListener("click", this._changeDeleteBoardCheckedState)
            boardsElement.addEventListener("click", this._changeShareBoardCheckedState)
        }
    }

    populateBoardList(callback) {
        this.BoardListManagerService.listBoards((err, data) => {
            if (err) {
                console.log(err);
            }
            console.log(data);
            var newData = []

            for (var i = 0; i < data.length; i++) {
                let newTemp = {
                    checkbox: {
                        name: 'board-checkbox-' + i,
                        checked: false
                    },
                    deletebox: {
                        name: 'delete-checkbox-' + i,
                        checked: false
                    },
                    sharebox: {
                        name: 'share-checkbox-' + i,
                        checked: false
                    },
                    input: {
                        old_value: data[i].path.split('/')[0],
                        name: 'board-input-' + i,
                        value: data[i].path.split('/')[0],
                        readOnly: true,
                        status: 'board'
                    },
                    path: data[i].path,
                    identifier: data[i].identifier
                }
                newData.push(newTemp)
            }

            console.log(newData);

            callback(undefined, newData);
        })
    }

    _addNewListBoard() {
        // Get the identifier as the index of the new element
        let fieldIdentifier = this.model.boards.length + 1;

        let newBoard = {
            checkbox: {
                name: 'board-checkbox-' + fieldIdentifier,
                checked: false
            },
            deletebox: {
                name: 'delete-checkbox-' + fieldIdentifier,
                checked: false
            },
            sharebox: {
                name: 'share-checkbox-' + fieldIdentifier,
                checked: false
            },
            input: {
                name: 'board-input-' + fieldIdentifier,
                value: this.model.board.value,
                old_value: this.model.board.value,
                readOnly: true,
                status: 'board'
            }
        };


        this.BoardListManagerService.createBoard("/", "boards", (err, data) => {
            if (err) {
                console.log(err);
            }
        });

        this.BoardListManagerService.createBoard("/boards", newBoard.input.value, (err, data) => {
            if (err) {
                console.log(err);
            }

            // Bring the path and the seed to the newBoard object
            newBoard = {
                ...newBoard,
                ...data
            };

            // Appended to the "boards" array
            this.model.boards.push(newBoard);

            // Clear the "board" view model
            this.model.board.value = '';
        });
    }

    stringIsBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    _mainInputBlurHandler = (event) => {
        // We shouldn't add a blank element in the list
        if (!this.stringIsBlank(event.target.value)) {
            this._addNewListBoard();
        }
    }

    importBoard = (event) => {
        let boardName = document.getElementById("importBoard").value;
        let seed = document.getElementById("importSeed").value;

        if (!this.stringIsBlank(boardName) && !this.stringIsBlank(seed))
        {
            console.log(boardName + " " + seed)

            let fieldIdentifier = this.model.boards.length + 1;

        let newBoard = {
            checkbox: {
                name: 'board-checkbox-' + fieldIdentifier,
                checked: false
            },
            deletebox: {
                name: 'delete-checkbox-' + fieldIdentifier,
                checked: false
            },
            sharebox: {
                name: 'share-checkbox-' + fieldIdentifier,
                checked: false
            },
            input: {
                name: 'board-input-' + fieldIdentifier,
                value: boardName,
                old_value: boardName,
                readOnly: true,
                status: 'board'
            }
        };


        this.BoardListManagerService.createBoard("/", "boards", (err, data) => {
            if (err) {
                console.log(err);
            }
        });

        this.BoardListManagerService.importBoard("/boards", newBoard.input.value, seed, (err, data) => {
            if (err) {
                console.log(err);
            }

            // Bring the path and the seed to the newBoard object
            newBoard = {
                ...newBoard,
                ...data
            };

            // Appended to the "boards" array
            this.model.boards.push(newBoard);

            document.getElementById("importBoard").value = "";
            document.getElementById("importSeed").value = "";
        });
        }
    }

    boardIsValid(board) {
        // Check if the board element is valid or not
        return !(!board || !board.input || !board.checkbox || !board.path);
    }

    setBoardsClean = (newBoards) => {
        // Set the model fresh, without proxies
        this.model.boards = JSON.parse(JSON.stringify(newBoards))

    }

    _changeDeleteBoardCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('delete-checkbox')) {
            return;
        }

        // Find the wanted element and remove it
        let boards = this.model.boards
        let itemIndex = boards.findIndex((board) => board.deletebox.name === event.target.name)

        this.removeBoard(boards[itemIndex]);
        boards.splice(itemIndex, 1);

        this.setBoardsClean(boards);
    }

    removeBoard(board) {
        if (!this.boardIsValid(board)) {
            return;
        }
        this.BoardListManagerService.removeBoard("/boards", board.input.value, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    shareBoard(board) {
        if (!this.boardIsValid(board)) {
            return;
        }
        this.BoardListManagerService.shareBoard("/boards", board.input.value, (err, data) => {
            if (err) {
                return console.log(err);
            }
            return data;
        })
    }


    _changeShareBoardCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('share-checkbox')) {
            return;
        }

        // Find the wanted element and remove it
        let boards = this.model.boards
        let itemIndex = boards.findIndex((board) => board.sharebox.name === event.target.name)

        console.log(boards)

        this.BoardListManagerService.shareBoard("/boards", boards[itemIndex].input.value, (err, data) => {
            if (err) {
                return console.log(err);
            }
            console.log(data);
            // boards[itemIndex].input.value = data;
            window.prompt(`Share this SEED and use it to import the board ${boards[itemIndex].input.value}:`, data)
            return data;
        })

        this.setBoardsClean(boards);
    }
}
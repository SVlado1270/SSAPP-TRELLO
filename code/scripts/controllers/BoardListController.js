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

        // Selecting the parent of all the boards and add the event listeners
        const boardsElement = this.getElementByTag('boards');
        if (boardsElement) {
            boardsElement.addEventListener("focusout", this._blurHandler)
            boardsElement.addEventListener("click", this._changeBoardCheckedState)
            boardsElement.addEventListener("dblclick", this._doubleClickHandler)
        }
    }

    populateBoardList(callback) {
        this.BoardListManagerService.listBoards((err, data) => {
            if (err) {
                console.log(err);
            }
            callback(undefined, data);
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
            input: {
                name: 'board-input-' + fieldIdentifier,
                value: this.model.board.value,
                readOnly: true,
                status: 'board'
            }
        };

        this.BoardListManagerService.createBoard(newBoard, (err, data) => {
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

    _blurHandler = (event) => {
        // Change the readOnly property to true and save the changes of the field
        let currentBoard = this.changeReadOnlyPropertyFromEventBoard(event, true);
        this.editListBoard(currentBoard);
    }

    _doubleClickHandler = (event) => {
        // Change the readOnly property in false so we can edit the field
        this.changeReadOnlyPropertyFromEventBoard(event, false);
    }

    changeReadOnlyPropertyFromEventBoard = (event, readOnly) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a board-input we ignore it
        if (!elementName || !elementName.includes('board-input')) {
            return;
        }

        // Find the wanted element and change the value of the read-only property
        let boards = this.model.boards
        let boardIndex = boards.findIndex((board) => board.input.name === elementName)
        boards[boardIndex].input = {
            ...boards[boardIndex].input,
            readOnly: readOnly
        }
        this.setBoardsClean(boards);
        return boards[boardIndex];
    }

    _changeBoardCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a board-checkbox we ignore it
        if (!elementName || !elementName.includes('board-checkbox')) {
            return;
        }

        // Find the wanted element and change the value of the checked property
        let boards = this.model.boards
        let boardIndex = boards.findIndex((board) => board.checkbox.name === event.target.name)
        boards[boardIndex].checkbox = {
            ...boards[boardIndex].checkbox,
            checked: !boards[boardIndex].checkbox.checked,
        }
        this.setBoardsClean(boards);
        this.editListBoard(boards[boardIndex]);
    }

    boardIsValid(board) {
        // Check if the board element is valid or not
        return !(!board || !board.input || !board.checkbox || !board.path);
    }

    editListBoard(board) {
        if(!this.boardIsValid(board)) {
            return;
        }
        this.BoardListManagerService.editBoard(board, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    setBoardsClean = (newBoards) => {
        // Set the model fresh, without proxies
        this.model.boards = JSON.parse(JSON.stringify(newBoards))
    }
}
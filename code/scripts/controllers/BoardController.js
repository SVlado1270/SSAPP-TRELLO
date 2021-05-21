import { getBoardManagerServiceInstance } from "../services/BoardManagerService.js";


const { Controller } = WebCardinal.controllers;

export default class BoardController extends Controller {
    constructor(...props) {
        super(...props);

        this.BoardManagerService = getBoardManagerServiceInstance();


        this.model = {
            toDoItems: [],
            doingItems: [],
            doneItems: [],
            item: {
                id: 'item',
                name: 'item',
                value: '',
                placeholder: 'Type your item here'
            },
            'no-todos': 'There are no TODOs',
            'no-doings': 'There are no DOINGs',
            'no-done': 'There are no DONEs'
        };

        // Init the listeners to handle events
        this.initListeners();

        // Populate existing todos to todo item list
        this.populateItemList((err, data) => {
            if (err) {
                return console.log(err);
            }
            this.setItemsClean(data);
        });

        // Populate existing doings to doing item list
        this.populateDoingItemList((err, data) => {
            if (err) {
                return console.log(err);
            }
            this.setDoingItemsClean(data);
        });

        // Populate existing dones to done item list
        this.populateDoneItemList((err, data) => {
            if (err) {
                return console.log(err);
            }
            this.setDoneItemsClean(data);
        });
    }

    initListeners = () => {
        // Select the creating field and add
        // focusout event listener
        // This is used for creating new todo elements
        const todoCreatorElement = this.getElementByTag('create-todo');
        if (todoCreatorElement) {
            todoCreatorElement.addEventListener("focusout", this._mainInputBlurHandler);
        }

        // Selecting the parent of all the toDoItems and add the event listeners
        const itemsElement = this.getElementByTag('toDoItems');
        if (itemsElement) {
            itemsElement.addEventListener("focusout", this._blurHandler)
            itemsElement.addEventListener("click", this._changeToDoCheckedState)
            itemsElement.addEventListener("click", this._changeDeleteToDoCheckedState)
            itemsElement.addEventListener("dblclick", this._doubleClickHandler)
        }

        // Selecting the parent of all the doingItems and add the event listeners
        const doingItemsElement = this.getElementByTag('doingItems');
        if (doingItemsElement) {
            doingItemsElement.addEventListener("focusout", this._blurHandlerDoing)
            doingItemsElement.addEventListener("click", this._changeDoingCheckedState)
            doingItemsElement.addEventListener("click", this._changeDeleteDoingCheckedState)
            doingItemsElement.addEventListener("dblclick", this._doubleClickHandlerDoing)
        }

         // Selecting the parent of all the doneItems and add the event listeners
        const doneItemsElement = this.getElementByTag('doneItems');
        if (doneItemsElement) {
            doneItemsElement.addEventListener("focusout", this._blurHandlerDone)
            doneItemsElement.addEventListener("click", this._changeDoneCheckedState)
            doneItemsElement.addEventListener("click", this._changeDeleteDoneCheckedState)
            doneItemsElement.addEventListener("dblclick", this._doubleClickHandlerDone)
        }
    }

    populateItemList(callback) {
        this.BoardManagerService.listToDos((err, data) => {
            if (err) {
                console.log(err);
            }
            callback(undefined, data);
        })
    }

    populateDoingItemList(callback) {
        this.BoardManagerService.listDoings((err, data) => {
            if (err) {
                console.log(err);
            }
            callback(undefined, data);
        })
    }

    populateDoneItemList(callback) {
        this.BoardManagerService.listDone((err, data) => {
            if (err) {
                console.log(err);
            }
            callback(undefined, data);
        })
    }



    _addNewListItem() {
        // Get the identifier as the index of the new element
        let fieldIdentifier = this.model.toDoItems.length + 1;

        let newItem = {
            checkbox: {
                name: 'todo-checkbox-' + fieldIdentifier,
                checked: false
            },
            deletebox: {
                name:'delete-checkbox-' +fieldIdentifier,
                checked: false
            },
            input: {
                name: 'todo-input-' + fieldIdentifier,
                value: this.model.item.value,
                readOnly: true,
            }
        };

        this.BoardManagerService.createToDo(newItem, (err, data) => {
            if (err) {
                console.log(err);
            }

            // Bring the path and the seed to the newItem object
            newItem = {
                ...newItem,
                ...data
            };

            // Appended to the "items" array
            this.model.toDoItems.push(newItem);

            // Clear the "item" view model
            this.model.item.value = '';
        });
    }

    _addNewDoingListItem(newItem) {
        this.BoardManagerService.createDoing(newItem, (err, data) => {
            if (err) {
                console.log(err);
            }
            this.model.doingItems.push(newItem);
        });
    }

    _addNewDoneListItem(newItem) {
        this.BoardManagerService.createDone(newItem, (err, data) => {
            if (err) {
                console.log(err);
            }

            this.model.doneItems.push(newItem);
        });
    }



    stringIsBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    _mainInputBlurHandler = (event) => {
        // We shouldn't add a blank element in the list
        if (!this.stringIsBlank(event.target.value)) {
            this._addNewListItem();
        }
    }




    _blurHandler = (event) => {
        // Change the readOnly property to true and save the changes of the field
        let currentToDo = this.changeReadOnlyPropertyFromEventItem(event, true);
        this.editListItem(currentToDo);
    }

    _blurHandlerDoing = (event) => {
        // Change the readOnly property to true and save the changes of the field
        let currentDoing = this.changeReadOnlyPropertyFromEventItemDoing(event, true);
        this.editDoingListItem(currentDoing);
    }

    _blurHandlerDone= (event) => {
        // Change the readOnly property to true and save the changes of the field
        let curretDone = this.changeReadOnlyPropertyFromEventItemDone(event, true);
        this.editDoneListItem(curretDone);
    }



    _doubleClickHandler = (event) => {
        // Change the readOnly property in false so we can edit the field
        this.changeReadOnlyPropertyFromEventItem(event, false);
    }

    _doubleClickHandlerDoing = (event) => {
        // Change the readOnly property in false so we can edit the field
        this.changeReadOnlyPropertyFromEventItemDoing(event, false);
    }

    _doubleClickHandlerDone = (event) => {
        // Change the readOnly property in false so we can edit the field
        this.changeReadOnlyPropertyFromEventItemDone(event, false);
    }


    changeReadOnlyPropertyFromEventItem = (event, readOnly) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-input we ignore it
        if (!elementName || !elementName.includes('todo-input')) {
            return;
        }

        // Find the wanted element and change the value of the read-only property
        let toDoItems = this.model.toDoItems
        let itemIndex = toDoItems.findIndex((todo) => todo.input.name === elementName)
        toDoItems[itemIndex].input = {
            ...toDoItems[itemIndex].input,
            readOnly: readOnly
        }
        this.setItemsClean(toDoItems);
        return toDoItems[itemIndex];
    }

    changeReadOnlyPropertyFromEventItemDoing = (event, readOnly) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-input we ignore it
        if (!elementName || !elementName.includes('todo-input')) {
            return;
        }

        // Find the wanted element and change the value of the read-only property
        let doingItems = this.model.doingItems
        let itemIndex = doingItems.findIndex((doing) => doing.input.name === elementName)
        doingItems[itemIndex].input = {
            ...doingItems[itemIndex].input,
            readOnly: readOnly
        }
        this.setDoingItemsClean(doingItems);
        return doingItems[itemIndex];
    }

    changeReadOnlyPropertyFromEventItemDone = (event, readOnly) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-input we ignore it
        if (!elementName || !elementName.includes('todo-input')) {
            return;
        }

        // Find the wanted element and change the value of the read-only property
        let doneItems = this.model.doneItems
        let itemIndex = doneItems.findIndex((done) => done.input.name === elementName)
        doneItems[itemIndex].input = {
            ...doneItems[itemIndex].input,
            readOnly: readOnly
        }
        this.setDoneItemsClean(doneItems);
        return doneItems[itemIndex];
    }

    _changeToDoCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('todo-checkbox')) {
            return;
        }

        // Find the wanted element and change the value of the checked property
        let toDoItems = this.model.toDoItems
        let itemIndex = toDoItems.findIndex((todo) => todo.checkbox.name === event.target.name)

        //MOVE TO DOING (ADD IN DOING + REMOVE FROM TODO) + UPDATE
        this._addNewDoingListItem(toDoItems[itemIndex]);
        let doingItems = this.model.doingItems


        this.removeListItem(toDoItems[itemIndex]);
        toDoItems.splice(itemIndex, 1);

        // UPDATE TODO + DOING UI
        this.setItemsClean(toDoItems);
        this.setDoingItemsClean(doingItems);
    }

    _changeDoingCheckedState = (event) => {
            let elementName = event.target.name;
            // If the element that triggered the event was not a todo-checkbox we ignore it
            if (!elementName || !elementName.includes('todo-checkbox')) {
                return;
            }
    
            // Find the wanted element and change the value of the checked property
            let doingItems = this.model.doingItems
            let itemIndex = doingItems.findIndex((doing) => doing.checkbox.name === event.target.name)
    
            //MOVE TO DONE (ADD IN DONE + REMOVE FROM DOING) + UPDATE
            this._addNewDoneListItem(doingItems[itemIndex]);
            let doneItems = this.model.doneItems
    
    
            this.removeDoingListItem(doingItems[itemIndex]);
            doingItems.splice(itemIndex, 1);
    
            // UPDATE DOING + DONE UI
            this.setDoingItemsClean(doingItems);
            this.setDoneItemsClean(doneItems);
    }

    _changeDoneCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('todo-checkbox')) {
            return;
        }

        // Find the wanted element and change the value of the checked property
        let doneItems = this.model.doneItems
        let itemIndex = doneItems.findIndex((done) => done.checkbox.name === event.target.name)

        this.setDoneItemsClean(doneItems);
        this.editDoneListItem(doneItems[itemIndex]);
    }

    _changeDeleteToDoCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('delete-checkbox')) {
            return;
        }

        // Find the wanted element and remove it
        let toDoItems = this.model.toDoItems
        let itemIndex = toDoItems.findIndex((todo) => todo.deletebox.name === event.target.name)
        
        this.removeListItem(toDoItems[itemIndex]);
        toDoItems.splice(itemIndex, 1);
        
        this.setItemsClean(toDoItems);
    }

    _changeDeleteDoingCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('delete-checkbox')) {
            return;
        }

        // Find the wanted element and remove it
        let doingItems = this.model.doingItems
        let itemIndex = doingItems.findIndex((doing) => doing.deletebox.name === event.target.name)
        
        this.removeDoingListItem(doingItems[itemIndex]);
        doingItems.splice(itemIndex, 1);
        
        this.setDoingItemsClean(doingItems);
    }

    _changeDeleteDoneCheckedState = (event) => {
        let elementName = event.target.name;
        // If the element that triggered the event was not a todo-checkbox we ignore it
        if (!elementName || !elementName.includes('delete-checkbox')) {
            return;
        }

        // Find the wanted element and remove it
        let doneItems = this.model.doneItems
        let itemIndex = doneItems.findIndex((done) => done.deletebox.name === event.target.name)
        
        this.removeDoneListItem(doneItems[itemIndex]);
        doneItems.splice(itemIndex, 1);
        
        this.setDoneItemsClean(doneItems);
    }

    itemIsValid(item) {
        // Check if the todo element is valid or not
        return !(!item || !item.input || !item.checkbox || !item.path || !item.deletebox);
    }

    editListItem(todo) {
        if(!this.itemIsValid(todo)) {
            return;
        }
        this.BoardManagerService.editToDo(todo, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    editDoingListItem(doing) {
        if(!this.itemIsValid(doing)) {
            return;
        }
        this.BoardManagerService.editDoing(doing, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    editDoneListItem(done) {
        if(!this.itemIsValid(done)) {
            return;
        }
        this.BoardManagerService.editDone(done, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    removeListItem(todo) {
        if(!this.itemIsValid(todo)) {
            return;
        }
        this.BoardManagerService.removeToDo(todo.path, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    removeDoingListItem(doing) {
        if(!this.itemIsValid(doing)) {
            return;
        }
        this.BoardManagerService.removeDoing(doing.path, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    removeDoneListItem(done) {
        if(!this.itemIsValid(done)) {
            return;
        }
        this.BoardManagerService.removeDone(done.path, (err, data) => {
            if (err) {
                return console.log(err);
            }
        })
    }

    setItemsClean = (newItems) => {
        // Set the model fresh, without proxies
        this.model.toDoItems = JSON.parse(JSON.stringify(newItems))
        console.log(newItems)
    }

    setDoingItemsClean = (newItems) => {
        this.model.doingItems = JSON.parse(JSON.stringify(newItems))
    }

    setDoneItemsClean = (newItems) => {
        this.model.doneItems = JSON.parse(JSON.stringify(newItems))
    }

}
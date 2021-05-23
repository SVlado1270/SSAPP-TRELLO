console.log("Loaded from domain.js");
const BOARD_NAME = "/TEST_BOARD"
const BOARD_MOUNTING_PATH = "data/boards"
const TODO_MOUNTING_PATH = `${BOARD_NAME}/todos`;
const DOING_MOUNTING_PATH = `${BOARD_NAME}/doings`;
const DONE_MOUNTING_PATH = `${BOARD_NAME}/done`;
const openDSU = require("opendsu");
const keyssiresolver = openDSU.loadApi("resolver");
const securityContext = openDSU.loadApi("sc");
let mainDSU;

//TODO -> BOARD/TODOS /item1
//                    /item2
//     ->      /DOINGS/item1

$$.swarms.describe('itemSwarm', {
    start: function (data) {
        this.__initMainDSU();
        this.createToDo(data);
    },

    createToDo: function (data) {
        this.__initMainDSU();
        const keyssiSpace = openDSU.loadApi("keyssi");
        mainDSU.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, TODO_MOUNTING_PATH, keySSI)
                    });
                });
            });
        });
    },

    createDoing: function (data) {
        this.__initMainDSU();
        const keyssiSpace = openDSU.loadApi("keyssi");
        mainDSU.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, DOING_MOUNTING_PATH, keySSI)
                    });
                });
            });
        });
    },

    createDone: function (data) {
        this.__initMainDSU();
        const keyssiSpace = openDSU.loadApi("keyssi");
        mainDSU.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, DONE_MOUNTING_PATH, keySSI)
                    });
                });
            });
        });
    },

    createBoard: function (data) {
        this.__initMainDSU();
        const keyssiSpace = openDSU.loadApi("keyssi");
        mainDSU.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data/boards', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, BOARD_NAME, keySSI)
                    });
                });
            });
        });
    },



    editToDo: function (editedToDo) {
        this.__initMainDSU();
        this.__listToDos((err, todos) => {
            if (err) {
                return this.return(err);
            }
            let wantedToDo = todos.find(todo => todo.path === editedToDo.path);
            if (!wantedToDo) {
                return this.return(new Error('Todo with path ' + editedToDo.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedToDo.identifier, (err, todoDossier) => {
                if (err) {
                    return this.return(err);
                }
                todoDossier.writeFile('/data', JSON.stringify(editedToDo), this.return);
            })
        });
    },

    editDoing: function (editedDoing) {
        this.__initMainDSU();
        this.__listDoings((err, doings) => {
            if (err) {
                return this.return(err);
            }
            let wantedDoing = doings.find(doing => doing.path === editedDoing.path);
            if (!wantedDoing) {
                return this.return(new Error('Todo with path ' + editedDoing.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedDoing.identifier, (err, doingDossier) => {
                if (err) {
                    return this.return(err);
                }
                doingDossier.writeFile('/data', JSON.stringify(editedDoing), this.return);
            })
        });
    },

    editDone: function (editedDone) {
        this.__initMainDSU();
        this.__listDone((err, done) => {
            if (err) {
                return this.return(err);
            }
            let wantedDone = done.find(done => done.path === editedDone.path);
            if (!wantedDone) {
                return this.return(new Error('Todo with path ' + editedDone.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedDone.identifier, (err, doneDossier) => {
                if (err) {
                    return this.return(err);
                }
                doneDossier.writeFile('/data', JSON.stringify(doneDossier), this.return);
            })
        });
    },

    editBoard: function (editedBoard) {
        this.__initMainDSU();
        this.__listBoards((err, boards) => {
            if (err) {
                return this.return(err);
            }
            let wantedBoard = boards.find(board => board.path === editedBoard.path);
            if (!wantedBoards) {
                return this.return(new Error('Todo with path ' + editedBoard.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedBoard.identifier, (err, boardDossier) => {
                if (err) {
                    return this.return(err);
                }
                dooneDossier.writeFile('/data/boards', JSON.stringify(boardDossier), this.return);
            })
        });
    },



    listToDos: function () {
        this.__initMainDSU();
        this.__listToDos((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    listDoings: function () {
        this.__initMainDSU();
        this.__listDoings((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    listDone: function () {
        this.__initMainDSU();
        this.__listDone((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    listBoards: function () {
        this.__initMainDSU();
        this.__listBoards((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },


    __listToDos: function (callback) {
        mainDSU.readDir(TODO_MOUNTING_PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getToDos = (todo) => {
                let appPath = TODO_MOUNTING_PATH + '/' + todo.path;
                mainDSU.readFile(appPath + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: todo.identifier
                    });
                    if (applications.length > 0) {
                        getToDos(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getToDos(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    __listDoings: function (callback) {
        mainDSU.readDir(DOING_MOUNTING_PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getDoings = (doing) => {
                let appPath = DOING_MOUNTING_PATH + '/' + doing.path;
                mainDSU.readFile(appPath + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: doing.identifier
                    });
                    if (applications.length > 0) {
                        getDoings(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getDoings(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    __listDone: function (callback) {
        mainDSU.readDir(DONE_MOUNTING_PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getDone = (done) => {
                let appPath = DONE_MOUNTING_PATH + '/' + done.path;
                mainDSU.readFile(appPath + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: done.identifier
                    });
                    if (applications.length > 0) {
                        getDone(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getDone(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    __listBoards: function (callback) {
        mainDSU.readDir(BOARD_MOUNTING_PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getBoards = (board) => {
                let appPath = BOARD_NAME + '/' + board.path;
                mainDSU.readFile(appPath + '/data/boards', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: board.identifier
                    });
                    if (applications.length > 0) {
                        getBoards(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getBoards(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },



    removeItem(applicationPath) {
        this.__initMainDSU();
        mainDSU.unmount(applicationPath, (err, data) => {
            if (err) {
                return this.return(err);
            }
            return this.return(err, data);
        });
    },

    mountDossier: function (parentDossier, mountingPath, seed) {
        const PskCrypto = require("pskcrypto");
        const hexDigest = PskCrypto.pskHash(seed, "hex");
        let path = `${mountingPath}/${hexDigest}`;
        parentDossier.mount(path, seed, (err) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            this.return(undefined, {path: path, seed: seed});
        });
    },

    __initMainDSU: function () {
        try {
            mainDSU = securityContext.getMainDSU();
        } catch (err) {
            return this.return(err);
        }
    }
});


$$.swarms.describe('boardSwarm', {
    start: function (data) {
        this.__initMainDSU();
        this.createBoard(data);
    },

    createBoard: function (data) {
        this.__initMainDSU();
        const keyssiSpace = openDSU.loadApi("keyssi");
        mainDSU.getKeySSI((err, ssi) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                newDossier.writeFile('/data/boards', JSON.stringify(data), (err, digest) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }
                    newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, BOARD_NAME, keySSI)
                    });
                });
            });
        });
    },

    editBoard: function (editedBoard) {
        this.__initMainDSU();
        this.__listBoards((err, boards) => {
            if (err) {
                return this.return(err);
            }
            let wantedBoard = boards.find(board => board.path === editedBoard.path);
            if (!wantedBoard) {
                return this.return(new Error('Todo with path ' + editedBoard.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedBoard.identifier, (err, boardDossier) => {
                if (err) {
                    return this.return(err);
                }
                dooneDossier.writeFile('/data/boards', JSON.stringify(boardDossier), this.return);
            })
        });
    },

    listBoards: function () {
        this.__initMainDSU();
        this.__listBoards((err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listBoards: function (callback) {
        mainDSU.readDir(BOARD_MOUNTING_PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getBoards = (board) => {
                let appPath = BOARD_NAME + '/' + board.path;
                mainDSU.readFile(appPath + '/data/boards', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: board.identifier
                    });
                    if (applications.length > 0) {
                        getBoards(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getBoards(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    removeItem(applicationPath) {
        this.__initMainDSU();
        mainDSU.unmount(applicationPath, (err, data) => {
            if (err) {
                return this.return(err);
            }
            return this.return(err, data);
        });
    },

    mountDossier: function (parentDossier, mountingPath, seed) {
        const PskCrypto = require("pskcrypto");
        const hexDigest = PskCrypto.pskHash(seed, "hex");
        let path = `${mountingPath}/${hexDigest}`;
        parentDossier.mount(path, seed, (err) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            this.return(undefined, {path: path, seed: seed});
        });
    },

    __initMainDSU: function () {
        try {
            mainDSU = securityContext.getMainDSU();
        } catch (err) {
            return this.return(err);
        }
    }
});
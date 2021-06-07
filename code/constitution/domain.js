domainRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"./../../domain":[function(require,module,exports){
const commons = require('./commons');
console.log("Loaded from domain.js");
const BOARD_NAME = "Board1"
const BOARDS_MOUNTING_DIR = "/boards"
const BOARD_MOUNTING_PATH = `/boards/${BOARD_NAME}`
const TODO_MOUNTING_PATH = `/boards/${BOARD_NAME}/todos`;
const DOING_MOUNTING_PATH = `${BOARD_NAME}/doings`;
const DONE_MOUNTING_PATH = `${BOARD_NAME}/done`;
const openDSU = require("opendsu");
const keyssiresolver = openDSU.loadApi("resolver");
const securityContext = openDSU.loadApi("sc");
const keyssiSpace = require("opendsu").loadApi("keyssi");


let mainDSU;

//TODO -> BOARD/TODOS /item1
//                    /item2
//     ->      /DOINGS/item1




$$.swarms.describe('taskSwarm', {

    createTask: function (data, type, boardName) {
        // type = todos / doings / done aka path
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
                        this.mountDossier(mainDSU, `${BOARDS_MOUNTING_DIR}/${boardName}/${type}`, keySSI)
                    });
                });
            });
        });
    },

    listTasks: function (type, boardName) {
        this.__initMainDSU();
        this.__listTasks(type, boardName, (err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listTasks: function (type, boardName, callback) {
        mainDSU.readDir(`${BOARDS_MOUNTING_DIR}/${boardName}/${type}`, (err, applications) => {
            if (err) {
                return callback(err);
            }

            let toBeReturned = [];

            let getTasks = (task) => {
                let appPath = `${BOARDS_MOUNTING_DIR}/${boardName}/${type}` + '/' + task.path;


                mainDSU.readFile(appPath + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: task.identifier
                    });
                    if (applications.length > 0) {
                        getTasks(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getTasks(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    editTask: function (editedTask, type, boardName) {
        this.__initMainDSU();
        this.__listTasks(type, boardName, (err, tasks) => {
            if (err) {
                return this.return(err);
            }
            let wantedTask = tasks.find(task => task.path === editedTask.path);
            if (!wantedTask) {
                return this.return(new Error('Task with path ' + editedTask.path + ' not found.'));
            }

            keyssiresolver.loadDSU(wantedTask.identifier, (err, typeDossier) => {
                if (err) {
                    return this.return(err);
                }
                typeDossier.writeFile('/data', JSON.stringify(editedTask), this.return);
            })
        });
    },

    removeTask: function(applicationPath) {
        let splitPath = applicationPath.split('/');
        let name = splitPath.pop();
        let path =  splitPath.join('/');

        if (rawDossier) {
            return commons.getParentDossier(rawDossier, path, (err, parentKeySSI, relativePath) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }

                keyssiresolver.loadDSU(parentKeySSI, (err, parentDSU) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }

                    const unmountPath = `${path.replace(relativePath, '')}/${name}`;
                    parentDSU.unmount(unmountPath, (err, result) => {
                        if (err) {
                            console.error(err);
                            return this.return(err);
                        }

                        this.return(undefined, {
                            success: true,
                            path: path,
                            unmountPath: unmountPath,
                            result: result
                        });
                    });
                });
            });
        }

        this.return(new Error("Raw Dossier is not available."))
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

        mainDSU.readDir("/", {"ignoreMounts": false}, (err, apps) => {
            console.log("AAAAAAAA")
            console.log(apps);
        })

        mainDSU.readDir("/TEST_BOARD", {"ignoreMounts": false}, (err, apps) => {
            console.log("BBBBBBBB")
            console.log(apps);
        })

        mainDSU.listMountedDossiers("/", (err, apps) => {
            console.log("CCCCCCC")
            console.log(apps);
        })

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
                newDossier.getKeySSI((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }
                        this.mountDossier(mainDSU, `${data.input.value}`, keySSI)
                    });
            });
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

    readDir: function(path, options) {
        if (rawDossier){
            return rawDossier.readDir(path, options, this.return)
        }
    },

    __listBoards: function (callback) {
        
        console.log("AAAAAAAAAA")
        mainDSU.readDir(BOARDS_MOUNTING_DIR, {"ignoreMounts": false}, (err, apps) => {
            console.log(apps);
        })

        mainDSU.listMountedDossiers(BOARDS_MOUNTING_DIR, (err, apps) => {
            console.log(apps);
        })

        
        mainDSU.listMountedDossiers("/", (err, apps) => {
            console.log("ALL DOSSIERS:")
            console.log(apps)
        })

        mainDSU.readDir("/", (err, apps) => {
            console.log("ALL STUFF:")
            console.log(apps)
        })

        mainDSU.listMountedDossiers(BOARDS_MOUNTING_DIR, (err, apps) => {
            console.log("DOSSIERS:")
            console.log(apps)
            return callback(undefined, apps);
        })

    },

    removeBoard(applicationPath) {
        this.__initMainDSU();

        mainDSU.listMountedDossiers(`/boards/`, (err, apps) => {
            console.log("AAAAAAAA")
            console.log(apps);
        })

        mainDSU.unmount(`/boards/${applicationPath}`, (err, data) => {
            console.log("SHIT REMOVE")
            if (err) {
                console.log(err);
                return this.return(err);
            }
            console.log(data);
            return this.return(err, data);
        });
    },

    mountDossier: function (parentDossier, mountingPath, seed) {
        let path = `/boards/${mountingPath}`;
        console.log(`MOUNTINGPATH: ${path}`)
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




$$.swarms.describe("attachDossier", {
    newDossier: function(path, dossierName) {
        if (rawDossier) {
            rawDossier.getKeySSIAsString((err, ssi) => {
                if (err) {
                    return this.return(err);
                }

                keyssiresolver.createDSU(ssi, (err, newDossier) => {
                    if (err) {
                        return this.return(err);
                    }

                    newDossier.getKeySSIAsString((err, keySSI) => {
                        if (err) {
                            return this.return(err);
                        }

                        this.mountDossier(path, keySSI, dossierName);
                        console.log("AM MONTAT LA " + path + " " + dossierName)
                    });
                });
            });
        } else {
            this.return(new Error("Raw Dossier is not available."))
        }
    },
    fromSeed: function(path, dossierName, SEED) {
        if (rawDossier) {
            return keyssiresolver.loadDSU(SEED, (err) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }
                
                this.mountDossier(path, SEED, dossierName);
                console.log("AM IMPORTAT BOARD LA " + path + " " + dossierName)
            });
        }

        this.return(new Error("Raw Dossier is not available."));
    },
    mountDossier: function(path, keySSI, dossierName) {
        commons.getParentDossier(rawDossier, path, (err, parentKeySSI, relativePath) => {
            if (err) {
                return this.return(err);
            }

            let mountDossierIn = (parentDossier) => {

                let mountPoint = `${path.replace(relativePath, '')}/${dossierName}`;
                if (!mountPoint.startsWith("/")) {
                    mountPoint = "/" + mountPoint;
                }
                parentDossier.mount(mountPoint, keySSI, (err) => {
                    if (err) {
                        return this.return(err)
                    }
                    this.return(undefined, keySSI);
                });
            }

            //make sure if is the case to work with the current rawDossier instance
            rawDossier.getKeySSIAsString((err, keySSI) => {
                if (err) {
                    return this.return(err);
                }

                if (parentKeySSI !== keySSI) {
                    return keyssiresolver.loadDSU(parentKeySSI, (err, parentRawDossier) => {
                        if (err) {
                            return this.return(err);
                        }
                        mountDossierIn(parentRawDossier);
                    });
                }
                mountDossierIn(rawDossier);
            });
        });
    }
});

$$.swarms.describe('rename', {
    start: function(oldPath, newPath) {
        if (rawDossier) {
            rawDossier.rename(oldPath, newPath, (err) => {
                if (err) {
                    return this.return(new Error(err));
                }

                this.return(undefined, {
                    success: true,
                    oldPath: oldPath,
                    newPath: newPath
                })
            });
        } else {
            this.return(new Error("Raw Dossier is not available."));
        }
    }
});

$$.swarms.describe('delete', {
    fileFolder: function(path) {
        if (rawDossier) {
            return rawDossier.delete(path, (err, result) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }

                this.return(undefined, {
                    success: true,
                    path: path,
                    result: result
                });
            });
        }

        this.return(new Error("Raw Dossier is not available."))
    },
    dossier: function(path, name) {
        if (rawDossier) {
            return commons.getParentDossier(rawDossier, path, (err, parentKeySSI, relativePath) => {
                if (err) {
                    console.error(err);
                    return this.return(err);
                }

                keyssiresolver.loadDSU(parentKeySSI, (err, parentDSU) => {
                    if (err) {
                        console.error(err);
                        return this.return(err);
                    }

                    const unmountPath = `${path.replace(relativePath, '')}/${name}`;
                    parentDSU.unmount(unmountPath, (err, result) => {
                        if (err) {
                            console.error(err);
                            return this.return(err);
                        }

                        this.return(undefined, {
                            success: true,
                            path: path,
                            unmountPath: unmountPath,
                            result: result
                        });
                    });
                });
            });
        }

        this.return(new Error("Raw Dossier is not available."))
    }
});

$$.swarms.describe('listDossiers', {
    getMountedDossier: function(path) {
        commons.getParentDossier(rawDossier, path, (err, parentKeySSI, relativePath) => {
            if (err) {
                return this.return(err);
            }
            this.return(undefined, relativePath);
        });
    },
    printSeed: function(path, dossierName) {
        if (rawDossier) {
            return rawDossier.listMountedDossiers(path, (err, result) => {
                if (err) {
                    return this.return(err);
                }

                let dossier = result.find((dsr) => dsr.path === dossierName);
                if (!dossier) {
                    return this.return(new Error(`Dossier with the name ${dossierName} was not found in the mounted points!`));
                }
                
                this.return(undefined, dossier.identifier);
            });
        }

        this.return(new Error("Raw Dossier is not available."));
    }
});

// $$.swarms.describe('itemSwarm', {
//     start: function (data) {
//         this.__initMainDSU();
//         this.createToDo(data);
//     },

//     createToDo: function (data) {
//         this.__initMainDSU();
//         const keyssiSpace = openDSU.loadApi("keyssi");
//         mainDSU.getKeySSI((err, ssi) => {
//             if (err) {
//                 console.error(err);
//                 return this.return(err);
//             }
//             const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
//             keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
//                 if (err) {
//                     console.error(err);
//                     return this.return(err);
//                 }
//                 newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
//                     if (err) {
//                         console.error(err);
//                         return this.return(err);
//                     }
//                     newDossier.getKeySSI((err, keySSI) => {
//                         if (err) {
//                             return this.return(err);
//                         }
//                         this.mountDossier(mainDSU, TODO_MOUNTING_PATH, keySSI)
//                     });
//                 });
//             });
//         });
//     },

//     createDoing: function (data) {
//         this.__initMainDSU();
//         const keyssiSpace = openDSU.loadApi("keyssi");
//         mainDSU.getKeySSI((err, ssi) => {
//             if (err) {
//                 console.error(err);
//                 return this.return(err);
//             }
//             const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
//             keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
//                 if (err) {
//                     console.error(err);
//                     return this.return(err);
//                 }
//                 newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
//                     if (err) {
//                         console.error(err);
//                         return this.return(err);
//                     }
//                     newDossier.getKeySSI((err, keySSI) => {
//                         if (err) {
//                             return this.return(err);
//                         }
//                         this.mountDossier(mainDSU, DOING_MOUNTING_PATH, keySSI)
//                     });
//                 });
//             });
//         });
//     },

//     createDone: function (data) {
//         this.__initMainDSU();
//         const keyssiSpace = openDSU.loadApi("keyssi");
//         mainDSU.getKeySSI((err, ssi) => {
//             if (err) {
//                 console.error(err);
//                 return this.return(err);
//             }
//             const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
//             keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
//                 if (err) {
//                     console.error(err);
//                     return this.return(err);
//                 }
//                 newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
//                     if (err) {
//                         console.error(err);
//                         return this.return(err);
//                     }
//                     newDossier.getKeySSI((err, keySSI) => {
//                         if (err) {
//                             return this.return(err);
//                         }
//                         this.mountDossier(mainDSU, DONE_MOUNTING_PATH, keySSI)
//                     });
//                 });
//             });
//         });
//     },

//     createBoard: function (data) {
//         this.__initMainDSU();
//         const keyssiSpace = openDSU.loadApi("keyssi");
//         mainDSU.getKeySSI((err, ssi) => {
//             if (err) {
//                 console.error(err);
//                 return this.return(err);
//             }
//             const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
//             keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
//                 if (err) {
//                     console.error(err);
//                     return this.return(err);
//                 }
//                 newDossier.writeFile('/data/boards', JSON.stringify(data), (err, digest) => {
//                     if (err) {
//                         console.error(err);
//                         return this.return(err);
//                     }
//                     newDossier.getKeySSI((err, keySSI) => {
//                         if (err) {
//                             return this.return(err);
//                         }
//                         this.mountDossier(mainDSU, BOARD_NAME, keySSI)
//                     });
//                 });
//             });
//         });
//     },



//     editToDo: function (editedToDo) {
//         this.__initMainDSU();
//         this.__listToDos((err, todos) => {
//             if (err) {
//                 return this.return(err);
//             }
//             let wantedToDo = todos.find(todo => todo.path === editedToDo.path);
//             if (!wantedToDo) {
//                 return this.return(new Error('Todo with path ' + editedToDo.path + ' not found.'));
//             }

//             keyssiresolver.loadDSU(wantedToDo.identifier, (err, todoDossier) => {
//                 if (err) {
//                     return this.return(err);
//                 }
//                 todoDossier.writeFile('/data', JSON.stringify(editedToDo), this.return);
//             })
//         });
//     },

//     editDoing: function (editedDoing) {
//         this.__initMainDSU();
//         this.__listDoings((err, doings) => {
//             if (err) {
//                 return this.return(err);
//             }
//             let wantedDoing = doings.find(doing => doing.path === editedDoing.path);
//             if (!wantedDoing) {
//                 return this.return(new Error('Todo with path ' + editedDoing.path + ' not found.'));
//             }

//             keyssiresolver.loadDSU(wantedDoing.identifier, (err, doingDossier) => {
//                 if (err) {
//                     return this.return(err);
//                 }
//                 doingDossier.writeFile('/data', JSON.stringify(editedDoing), this.return);
//             })
//         });
//     },

//     editDone: function (editedDone) {
//         this.__initMainDSU();
//         this.__listDone((err, done) => {
//             if (err) {
//                 return this.return(err);
//             }
//             let wantedDone = done.find(done => done.path === editedDone.path);
//             if (!wantedDone) {
//                 return this.return(new Error('Todo with path ' + editedDone.path + ' not found.'));
//             }

//             keyssiresolver.loadDSU(wantedDone.identifier, (err, doneDossier) => {
//                 if (err) {
//                     return this.return(err);
//                 }
//                 doneDossier.writeFile('/data', JSON.stringify(doneDossier), this.return);
//             })
//         });
//     },

//     editBoard: function (editedBoard) {
//         this.__initMainDSU();
//         this.__listBoards((err, boards) => {
//             if (err) {
//                 return this.return(err);
//             }
//             let wantedBoard = boards.find(board => board.path === editedBoard.path);
//             if (!wantedBoards) {
//                 return this.return(new Error('Todo with path ' + editedBoard.path + ' not found.'));
//             }

//             keyssiresolver.loadDSU(wantedBoard.identifier, (err, boardDossier) => {
//                 if (err) {
//                     return this.return(err);
//                 }
//                 dooneDossier.writeFile('/data/boards', JSON.stringify(boardDossier), this.return);
//             })
//         });
//     },



//     listToDos: function () {
//         this.__initMainDSU();
//         this.__listToDos((err, data) => {
//             if (err) {
//                 return this.return(err);
//             }
//             this.return(err, data);
//         });
//     },

//     listDoings: function () {
//         this.__initMainDSU();
//         this.__listDoings((err, data) => {
//             if (err) {
//                 return this.return(err);
//             }
//             this.return(err, data);
//         });
//     },

//     listDone: function () {
//         this.__initMainDSU();
//         this.__listDone((err, data) => {
//             if (err) {
//                 return this.return(err);
//             }
//             this.return(err, data);
//         });
//     },

//     listBoards: function () {
//         this.__initMainDSU();
//         this.__listBoards((err, data) => {
//             if (err) {
//                 return this.return(err);
//             }
//             this.return(err, data);
//         });
//     },


//     __listToDos: function (callback) {
//         mainDSU.readDir(TODO_MOUNTING_PATH, (err, applications) => {
//             if (err) {
//                 return callback(err);
//             }
//             let toBeReturned = [];

//             let getToDos = (todo) => {
//                 let appPath = TODO_MOUNTING_PATH + '/' + todo.path;
//                 mainDSU.readFile(appPath + '/data', (err, fileContent) => {
//                     toBeReturned.push({
//                         ...JSON.parse(fileContent),
//                         path: appPath,
//                         identifier: todo.identifier
//                     });
//                     if (applications.length > 0) {
//                         getToDos(applications.shift())
//                     } else {
//                         return callback(undefined, toBeReturned);
//                     }
//                 });
//             };
//             if (applications.length > 0) {
//                 return getToDos(applications.shift());
//             }
//             return callback(undefined, toBeReturned);
//         })
//     },

//     __listDoings: function (callback) {
//         mainDSU.readDir(DOING_MOUNTING_PATH, (err, applications) => {
//             if (err) {
//                 return callback(err);
//             }
//             let toBeReturned = [];

//             let getDoings = (doing) => {
//                 let appPath = DOING_MOUNTING_PATH + '/' + doing.path;
//                 mainDSU.readFile(appPath + '/data', (err, fileContent) => {
//                     toBeReturned.push({
//                         ...JSON.parse(fileContent),
//                         path: appPath,
//                         identifier: doing.identifier
//                     });
//                     if (applications.length > 0) {
//                         getDoings(applications.shift())
//                     } else {
//                         return callback(undefined, toBeReturned);
//                     }
//                 });
//             };
//             if (applications.length > 0) {
//                 return getDoings(applications.shift());
//             }
//             return callback(undefined, toBeReturned);
//         })
//     },

//     __listDone: function (callback) {
//         mainDSU.readDir(DONE_MOUNTING_PATH, (err, applications) => {
//             if (err) {
//                 return callback(err);
//             }
//             let toBeReturned = [];

//             let getDone = (done) => {
//                 let appPath = DONE_MOUNTING_PATH + '/' + done.path;
//                 mainDSU.readFile(appPath + '/data', (err, fileContent) => {
//                     toBeReturned.push({
//                         ...JSON.parse(fileContent),
//                         path: appPath,
//                         identifier: done.identifier
//                     });
//                     if (applications.length > 0) {
//                         getDone(applications.shift())
//                     } else {
//                         return callback(undefined, toBeReturned);
//                     }
//                 });
//             };
//             if (applications.length > 0) {
//                 return getDone(applications.shift());
//             }
//             return callback(undefined, toBeReturned);
//         })
//     },

//     __listBoards: function (callback) {
//         mainDSU.readDir(BOARD_MOUNTING_PATH, (err, applications) => {
//             if (err) {
//                 return callback(err);
//             }
//             let toBeReturned = [];

//             let getBoards = (board) => {
//                 let appPath = BOARD_NAME + '/' + board.path;
//                 mainDSU.readFile(appPath + '/data/boards', (err, fileContent) => {
//                     toBeReturned.push({
//                         ...JSON.parse(fileContent),
//                         path: appPath,
//                         identifier: board.identifier
//                     });
//                     if (applications.length > 0) {
//                         getBoards(applications.shift())
//                     } else {
//                         return callback(undefined, toBeReturned);
//                     }
//                 });
//             };
//             if (applications.length > 0) {
//                 return getBoards(applications.shift());
//             }
//             return callback(undefined, toBeReturned);
//         })
//     },



//     removeItem(applicationPath) {
//         this.__initMainDSU();
//         mainDSU.unmount(applicationPath, (err, data) => {
//             if (err) {
//                 return this.return(err);
//             }
//             return this.return(err, data);
//         });
//     },

//     mountDossier: function (parentDossier, mountingPath, seed) {
//         const PskCrypto = require("pskcrypto");
//         const hexDigest = PskCrypto.pskHash(seed, "hex");
//         let path = `${mountingPath}/${hexDigest}`;
//         parentDossier.mount(path, seed, (err) => {
//             if (err) {
//                 console.error(err);
//                 return this.return(err);
//             }
//             this.return(undefined, {path: path, seed: seed});
//         });
//     },

//     __initMainDSU: function () {
//         try {
//             mainDSU = securityContext.getMainDSU();
//         } catch (err) {
//             return this.return(err);
//         }
//     }
// });
},{"./commons":"C:\\Users\\andre\\Desktop\\LicentaV2\\v3\\tutorial-workspace\\helloworld-ssapp\\domain\\commons.js","opendsu":false,"pskcrypto":false}],"C:\\Users\\andre\\Desktop\\LicentaV2\\v3\\tutorial-workspace\\helloworld-ssapp\\builds\\tmp\\domain_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.domainLoadModules = function(){ 

	if(typeof $$.__runtimeModules["./../../domain"] === "undefined"){
		$$.__runtimeModules["./../../domain"] = require("./../../domain");
	}
};
if (true) {
	domainLoadModules();
}
global.domainRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("domain");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../domain":"./../../domain"}],"C:\\Users\\andre\\Desktop\\LicentaV2\\v3\\tutorial-workspace\\helloworld-ssapp\\domain\\commons.js":[function(require,module,exports){
const getParentDossier = function(rawDossier, path, callback) {
    if (path === '' || path === '/') {
        return rawDossier.getKeySSIAsString((err, keySSI) => {
            if (err) {
                return callback(err);
            }

            callback(undefined, keySSI, "/");
        });
    }

    let paths = path.split('/');
    let wDir = paths.pop();
    let remainingPath = paths.join('/');

    rawDossier.listMountedDossiers(remainingPath, (err, mountPoints) => {
        if (err) {
            console.error(err);
            return callback(err);
        }

        let dossier = mountPoints.find((dsr) => {
            return dsr.path === wDir || _isSubPath(path, dsr.path);
        });

        if (!dossier) {
            return getParentDossier(rawDossier, remainingPath, callback);
        }

        callback(undefined, dossier.identifier, `${remainingPath}/${wDir}`);
    });
};

module.exports = {
    getParentDossier
};

const _isSubPath = function(path, subPath) {
    if (path !== '/') {
        path = `${path}/`;
    }

    return path.indexOf(`/${subPath}/`) !== -1;
}
},{}]},{},["C:\\Users\\andre\\Desktop\\LicentaV2\\v3\\tutorial-workspace\\helloworld-ssapp\\builds\\tmp\\domain_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"domain":"code\\constitution\\domain.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                
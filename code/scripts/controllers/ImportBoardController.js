const { Controller } = WebCardinal.controllers;
const model = {
    board: {
        label: "Board",
        name: "name",
        required: true,
        placeholder: "Add board name",
        value: ''
    },
    seed: {
        label: "Seed",
        name: "seed",
        required: true,
        placeholder: "Paste your seed (Board keySSI) here",
        value: ''
    }
}

export default class ImportBoardController extends Controller {
    constructor(element) {
        super(element);
        this.model = this.setModel(JSON.parse(JSON.stringify(model)));

        this.feedbackEmitter = null;

        this.on('openFeedback', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.feedbackEmitter = e.detail;
            console.log(this.feedbackEmitter)
        });
        let rowSubmit = () => {
            let name = this.model.board.value;
            let email = this.model.seed.value;
            window.prompt();
            if(name != "" && email !=""){
                console.log("SENT YESSS")
                this.feedbackEmitter(`You successfully sent your data, Thank you!`,"input Example","alert-success")
            } else{
                this.feedbackEmitter("You have not entered a name or an email, please enter one!","input Example","alert-danger")

            }
        }

        this.on("Input submit",rowSubmit, true);
    }
}
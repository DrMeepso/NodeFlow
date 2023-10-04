import { Node, Input, Output, Types } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

class Addition extends Node {

    name: string = "Addition"
    linear: boolean = true;

    constructor() {
        super();
        this.inputs = [new Input("A", Types.Number), new Input("B", Types.Number)];
        this.outputs = [new Output("Result", Types.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let A = inputs["A"];
        let B = inputs["B"];

        this.setOutput("Result", A + B);

    }

}

class Subtraction extends Node {

    name: string = "Subtraction"
    linear: boolean = true;

    constructor() {
        super();
        this.inputs = [new Input("A", Types.Number), new Input("B", Types.Number)];
        this.outputs = [new Output("Result", Types.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let A = inputs["A"];
        let B = inputs["B"];

        this.setOutput("Result", A - B);

    }

}

class Multiplication extends Node {

    name: string = "Multiplication"
    linear: boolean = true;

    constructor() {
        super();
        this.inputs = [new Input("A", Types.Number), new Input("B", Types.Number)];
        this.outputs = [new Output("Result", Types.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let A = inputs["A"];
        let B = inputs["B"];

        this.setOutput("Result", A * B);

    }

}

class Division extends Node {

    name: string = "Division"
    linear: boolean = true;

    constructor() {
        super();
        this.inputs = [new Input("A", Types.Number), new Input("B", Types.Number)];
        this.outputs = [new Output("Result", Types.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let A = inputs["A"];
        let B = inputs["B"];

        this.setOutput("Result", A / B);

    }

}

class Modulo extends Node {

    name: string = "Modulo"
    linear: boolean = true;

    constructor() {
        super();
        this.inputs = [new Input("A", Types.Number), new Input("B", Types.Number)];
        this.outputs = [new Output("Result", Types.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let A = inputs["A"];
        let B = inputs["B"];

        this.setOutput("Result", A % B);

    }

}

export default {

    name: "Maths",
    category: "Core",
    description: "Maths nodes",
    id: "maths",
    colour: "#ff0000",

    nodes: [

        { name: "+", node: Addition },
        { name: "-", node: Subtraction },
        { name: "×", node: Multiplication },
        { name: "÷", node: Division },
        { name: "%", node: Modulo }

    ]

}

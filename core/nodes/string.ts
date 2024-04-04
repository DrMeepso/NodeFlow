import { Node, Input, Output, NodeTypes } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

class Concat extends Node {

    name: string = "Concat"

    constructor() {
        super();
        this.inputs = [new Input("String 1", NodeTypes.String), new Input("String 2", NodeTypes.String)];
        this.outputs = [new Output("String", NodeTypes.String)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let string1 = inputs["String 1"];
        let string2 = inputs["String 2"];

        let string = string1 + string2;

        this.setOutput("String", string);

    }

}

class Length extends Node {

    name: string = "Length"

    constructor() {
        super();
        this.inputs = [new Input("String", NodeTypes.String)];
        this.outputs = [new Output("Length", NodeTypes.Number)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let string = inputs["String"];

        let length = string.length;

        this.setOutput("Length", length);

    }

}

class CharAt extends Node {

    name: string = "Char At"

    constructor() {
        super();
        this.inputs = [new Input("String", NodeTypes.String), new Input("Index", NodeTypes.Number)];
        this.outputs = [new Output("Char", NodeTypes.String)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let string = inputs["String"];
        let index = inputs["Index"];

        let char = string.charAt(index);

        this.setOutput("Char", char);

    }

}

class ToString extends Node {

    name: string = "To String"

    constructor() {
        super();
        this.inputs = [new Input("Value", NodeTypes.Any)];
        this.outputs = [new Output("String", NodeTypes.String)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let value = inputs["Value"];

        let string = value.toString();

        this.setOutput("String", string);

    }

}

export default {

    name: "String",
    category: "Core",
    description: "String nodes",
    id: "string",
    colour: "#ff0000",

    nodes: [

        { name: "Concat", node: Concat },
        { name: "Length", node: Length },
        { name: "Char At", node: CharAt },
        { name: "To String", node: ToString },

    ]

}
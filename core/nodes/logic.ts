import { Node, Input, Output, NodeTypes } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

class Equal extends Node {

    name: string = "=="

    constructor() {
        super();
        this.inputs = [new Input("Value 1", NodeTypes.Any), new Input("Value 2", NodeTypes.Any)];
        this.outputs = [new Output("Bool", NodeTypes.Boolean)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let value1 = inputs["Value 1"];
        let value2 = inputs["Value 2"];

        this.setOutput("Bool", value1 === value2);

    }

}

class NotEqual extends Equal {

    name: string = "!="

    constructor() {
        super();
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let value1 = inputs["Value 1"];
        let value2 = inputs["Value 2"];

        this.setOutput("Bool", value1 !== value2);

    }

}

export default {

    name: "Logic",
    category: "Core",
    description: "Logic nodes",
    id: "logic",
    colour: "#ff0000",

    nodes: [

        { name: "==", node: Equal },
        { name: "!=", node: NotEqual },

    ]

}
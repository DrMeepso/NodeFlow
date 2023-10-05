import { Node, Input, Output, Types } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

class Log extends Node {

    name: string = "Log"

    constructor() {
        super();
        this.inputs = [new Input("Signal", Types.Signal), new Input("Value", Types.Any)];
        this.outputs = [new Output("Signal", Types.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let value = inputs["Value"];
        typeof inputs["Value"] == "object" ? value = JSON.stringify(value) : value = value;
        typeof inputs["Value"] == "string" ? value = `"${value}"` : value = value.toString();

        this.log(value);

    }


}

export default {

    name: "Debug",
    category: "Core",
    description: "Debug nodes",
    id: "debug",
    colour: "#ff0000",

    nodes: [

        { name: "Log", node: Log },

    ]

}
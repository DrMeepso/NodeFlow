import { Node, Input, Output, Types } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

export class Log extends Node {

    name: string = "Log"

    constructor() {
        super();
        this.inputs = [new Output("Signal", Types.Signal), new Input("Value", Types.Any)];
        this.outputs = [new Output("Signal", Types.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let value = inputs["Value"];

        this.log(value);

    }


}
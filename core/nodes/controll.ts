
import { Node, Input, Output, Types } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

export class ForLoop extends Node {

    name: string = "For Loop"
    linear: boolean = false;

    constructor() {
        super();
        this.inputs = [new Input("Signal", Types.Signal), new Input("Start", Types.Number), new Input("End", Types.Number)];
        this.outputs = [new Output("Loop", Types.Signal), new Output("Index", Types.Number), new Output("End", Types.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let start = inputs["Start"];
        let end = inputs["End"];

        function CheckVal(i: number): boolean {
            if (end > start) {
                return i < end;
            } else {
                return i > end;
            }
        }

        for (let i = start; CheckVal(i); end > start ? i++ : i--) {
            let conn = this.parentBlueprint!.allConnections.find(connection => connection.output == this.outputs[0])
            if (conn == null) continue;
            let LoopFirstNode = this.parentBlueprint?.getNodesFromConnection(conn)?.In;
            this.setOutput("Index", i);
            

            let exOrder = await this.parentBlueprint?.getNodeExicutionOrder(LoopFirstNode!);
            if (exOrder == null) continue;
            await this.parentBlueprint?.runThoughExicutionOrder(exOrder);
        }
        this.setOutput("Index", end - 1);

        let conn = this.parentBlueprint!.allConnections.find(connection => connection.output == this.outputs[2])
        if (conn == null) return;
        let endFirstNode = this.parentBlueprint?.getNodesFromConnection(conn)?.In;
        
        let exOrder = await this.parentBlueprint?.getNodeExicutionOrder(endFirstNode!);
        if (exOrder == null) return;
        await this.parentBlueprint?.runThoughExicutionOrder(exOrder);
    }

}

export class Wait extends Node {

    name: string = "Wait"

    constructor() {
        super();
        this.inputs = [new Input("Signal", Types.Signal), new Input("Time", Types.Number)];
        this.outputs = [new Output("Signal", Types.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let time = inputs["Time"];

        this.setOutput("Signal", null);
        await new Promise(resolve => setTimeout(resolve, time * 1000));

    }

}
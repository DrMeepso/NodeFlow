
import { Node, Input, Output, NodeTypes } from "../node";
import { Blueprint, Runtime, Variable } from "../blueprint";

class ForLoop extends Node {

    name: string = "For Loop"
    linear: boolean = false;

    constructor() {
        super();
        this.inputs = [new Input("Signal", NodeTypes.Signal), new Input("Start", NodeTypes.Number), new Input("End", NodeTypes.Number)];
        this.outputs = [new Output("Loop", NodeTypes.Signal), new Output("Index", NodeTypes.Number), new Output("End", NodeTypes.Signal)];
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

        if (end !== start) {

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

        } else {

            this.warn("Start & End values are the same! the code hasnt been run!")

        }

        let conn = this.parentBlueprint!.allConnections.find(connection => connection.output == this.outputs[2])
        if (conn == null) return;
        let endFirstNode = this.parentBlueprint?.getNodesFromConnection(conn)?.In;

        let exOrder = await this.parentBlueprint?.getNodeExicutionOrder(endFirstNode!);
        if (exOrder == null) return;
        await this.parentBlueprint?.runThoughExicutionOrder(exOrder);
    }

}

class IfStatement extends Node {

    name: string = "If Statement"
    linear: boolean = false;

    constructor() {
        super();
        this.inputs = [new Input("Signal", NodeTypes.Signal), new Input("Condition", NodeTypes.Boolean)];
        this.outputs = [new Output("True", NodeTypes.Signal), new Output("False", NodeTypes.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let condition = inputs["Condition"];

        if (condition) {

            let conn = this.parentBlueprint!.allConnections.find(connection => connection.output == this.outputs[0])
            if (conn == null) return;
            let trueFirstNode = this.parentBlueprint?.getNodesFromConnection(conn)?.In;

            let exOrder = await this.parentBlueprint?.getNodeExicutionOrder(trueFirstNode!);
            if (exOrder == null) return;
            await this.parentBlueprint?.runThoughExicutionOrder(exOrder);

        } else {

            let conn = this.parentBlueprint!.allConnections.find(connection => connection.output == this.outputs[1])
            if (conn == null) return;
            let falseFirstNode = this.parentBlueprint?.getNodesFromConnection(conn)?.In;

            let exOrder = await this.parentBlueprint?.getNodeExicutionOrder(falseFirstNode!);
            if (exOrder == null) return;
            await this.parentBlueprint?.runThoughExicutionOrder(exOrder);

        }

    }

}

class Wait extends Node {

    name: string = "Wait"

    constructor() {
        super();
        this.inputs = [new Input("Signal", NodeTypes.Signal), new Input("Time", NodeTypes.Number)];
        this.outputs = [new Output("Signal", NodeTypes.Signal)];
    }

    async run(runtime: Runtime): Promise<void> {

        let inputs = this.getInputs();

        let time = inputs["Time"];

        this.setOutput("Signal", null);
        await new Promise(resolve => setTimeout(resolve, time * 1000));

    }

}

export default {

    name: "Control",
    category: "Core",
    description: "Control nodes",
    id: "control",
    colour: "#ff0000",

    nodes: [

        { name: "For Loop", node: ForLoop },
        { name: "If Statement", node: IfStatement },
        { name: "Wait", node: Wait },

    ]

}
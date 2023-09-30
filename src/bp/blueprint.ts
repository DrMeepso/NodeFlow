import { Node, Connection, Types, Input, Output } from "./node"
import { v4 as uuidv4 } from 'uuid';

interface Dependency {}

export class Blueprint {

    name: string = "Blueprint <Generic>"
    _id: string = uuidv4();
    _isRunning: boolean = false;

    allNodes: Node[] = [];
    allConnections: Connection[] = [];

    runtime: Runtime = new Runtime();
    dependencies: Dependency[] = [];

    // unused if no GUI is present
    Camera = {
        Position: { x: 0, y: 0 },
        Zoom: 1
    }

    constructor() {

        this.runtime.clearContext()

    }

    addNode(node: Node) {
        this.allNodes.push(node);
        node.parentBlueprint = this
    }

    connectNodes(input: Input, output: Output) {
        this.allConnections.push(new Connection(input, output));
    }

    getNodesFromConnection(connection: Connection) {

        let Out = this.allNodes.find(node => node.outputs.includes(connection.output));
        let In = this.allNodes.find(node => node.inputs.includes(connection.input));

        return { Out, In }
    }

    getNodeExicutionOrder(startNode: Node): Array<Node> {

        const LookedNodes: Array<Node> = [];
        const ExicutionOrder: Array<Node> = [];

        // starting at the first node work our way through the node tree and add all the nodes, if we encounter a node that has a input from a node we havent ran yet we run that node first
        // if we encounter a node that has a input from a node we have already ran we skip it

        const CurrentBlueprint = this;

        async function LookAtNode(node: Node) {

            if (LookedNodes.includes(node)) return;

            LookedNodes.push(node);

            // get all inputs that are connected to a node that we havent looked at yet
            let inputs = node.inputs.filter(input => CurrentBlueprint.allConnections.filter(connection => connection.input == input).some(connection => !LookedNodes.includes(CurrentBlueprint.allNodes.find(node => node.outputs.includes(connection.output))!)));
            await inputs.forEach(async (input, i) => {
                let connection = CurrentBlueprint.allConnections.find(connection => connection.input == inputs[i])!;
                let inputNode = CurrentBlueprint.allNodes.find(node => node.outputs.includes(connection.output))!;
                await LookAtNode(inputNode);
            })

            ExicutionOrder.push(node);

            // get all outputs that are connected to the node
            node.outputs.forEach(async (output, i) => {
                if (output.type != Types.Signal) return;
                let connections = CurrentBlueprint.allConnections.filter(connection => connection.output == output);
                connections.forEach(async (connection, i) => {
                    let outputNode = CurrentBlueprint.allNodes.find(node => node.inputs.includes(connection.input))!;
                    if (!LookedNodes.includes(outputNode)) {
                        await LookAtNode(outputNode);
                    }
                })
            })

        }

        LookAtNode(startNode);

        return ExicutionOrder;

    }

    async runBlueprint() {

        let ExicutionOrder = await this.getNodeExicutionOrder(this.allNodes.find(node => node.name == "Start")!);

        this.runtime.clearContext();

        this._isRunning = true;

        await this.runThoughExicutionOrder(ExicutionOrder);

        this._isRunning = false;

        console.log("Blueprint finished running")

    }

    async runThoughExicutionOrder(ExicutionOrder: Array<Node>) {

        for (let i = 0; i < ExicutionOrder.length; i++) {
            let node = ExicutionOrder[i];
            this.runtime.CurrentNode = node;
            await node.run(this.runtime);
        }

    }

}

interface OutputResult {

    OutputID: string;
    OutputValue: any;

}

export class Runtime {

    OutputResults: Array<OutputResult> = [];
    CurrentNode: Node | null = null;

    constructor() {

    }

    clearContext() {
        this.OutputResults = [];
        this.CurrentNode = null;
    }

    getOutput(id: string) {
        return this.OutputResults.find(output => output.OutputID == id);
    }
    setOutput(id: string, value: any) {
        this.OutputResults.push({ OutputID: id, OutputValue: value } as OutputResult);
    }

}
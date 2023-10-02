import { Vector2 } from "./generics";
import { Node, Connection, Types, Input, Output, StartNode } from "./node"
import { v4 as uuidv4 } from 'uuid';

interface Dependency { }

export class Variable {

    name: string;
    type: Types;
    value: any;

    constructor(name: string, type: Types, value: any) {
        this.name = name;
        this.type = type;
        this.value = value;
    }

}

export class Blueprint {

    name: string = "Blueprint <Generic>"
    _id: string = uuidv4();
    _isRunning: boolean = false;

    allNodes: Node[] = [];
    allConnections: Connection[] = [];

    allVariables: Variable[] = [];

    runtime: Runtime = new Runtime();
    dependencies: Dependency[] = [];

    // unused if no GUI is present
    Camera = {
        Position: { x: 0, y: 0 },
        Zoom: 1
    }

    constructor() {

        this.runtime.clearContext()

        let StartingNode = new StartNode();
        StartingNode._position = new Vector2(0, 0);
        this.addNode(StartingNode);


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
                if (input.type != Types.Signal) {
                    let connection = CurrentBlueprint.allConnections.find(connection => connection.input == inputs[i])!;
                    let inputNode = CurrentBlueprint.allNodes.find(node => node.outputs.includes(connection.output))!;
                    if (inputNode.linear == false) return;
                    await LookAtNode(inputNode);
                }
            })

            ExicutionOrder.push(node);

            if (node.linear == false) return;

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
        this.runtime.setAllVariables(this.allVariables);

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
            //console.log("Ran node: " + node.name)
        }

    }

    createVariable(name: string, type: Types, value: any): Variable {
        if (this.allVariables.some(variable => variable.name == name)) {
            throw new Error("Variable with name " + name + " already exists")
        }
        let vari = new Variable(name, type, value)
        this.allVariables.push(vari);
        console.log(this.allVariables)
        return vari;
    }

    getVariable(name: string) {
        return this.allVariables.find(variable => variable.name == name);
    }

}

interface OutputResult {

    OutputID: string;
    OutputValue: any;

}

export class Runtime {

    OutputResults: Array<OutputResult> = [];
    CurrentNode: Node | null = null;

    CurrentVariables: Array<Variable> = [];

    constructor() {

    }

    clearContext() {
        this.OutputResults = [];
        this.CurrentVariables = [];
        this.CurrentNode = null;
    }

    setAllVariables(variables: Variable[]) {

        variables.forEach(variable => {

            // if there is a better way of doing this please tell me!
            let JSONReparsed = JSON.parse(JSON.stringify(variable));

            let value: any

            // check if variable value is a class
            if (JSONReparsed.value instanceof Object) {
                // copy the class
                value = Object.assign(Object.create(Object.getPrototypeOf(JSONReparsed.value)), JSONReparsed.value);
            } else {
                value = JSONReparsed.value;
            }

            let VariableClone = new Variable(JSONReparsed.name, JSONReparsed.type, value);
            this.CurrentVariables.push(VariableClone);

        })

    }

    getVariable(name: string) {
        return this.CurrentVariables.find(variable => variable.name == name);
    }

    setVariable(name: string, value: any) {
        if (this.CurrentVariables.some(variable => variable.name == name)) {
            this.CurrentVariables.find(variable => variable.name == name)!.value = value;
            return;
        }
        this.CurrentVariables.push({ name: name, type: Types.Any, value: value } as Variable);
    }

    getOutput(id: string) {
        return this.OutputResults.find(output => output.OutputID == id);
    }
    setOutput(id: string, value: any) {
        if (this.OutputResults.some(output => output.OutputID == id)) {
            this.OutputResults.find(output => output.OutputID == id)!.OutputValue = value;
            return;
        }
        this.OutputResults.push({ OutputID: id, OutputValue: value } as OutputResult);
    }

}
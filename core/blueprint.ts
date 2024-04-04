import { Vector2 } from "./generics";
import { Node, Connection, type NodeType, Input, Output, StartNode, EventNode, NodeTypes } from "./node"
import { uuidv4 } from "./uuid"
import type { serializedBlueprint } from "./serialization";
import { deserializeBlueprint } from "./serialization";
import type { Catagory } from "./nodes";
import * as defaultNodes from "./nodes/index";

interface Dependency { }

//could be a interface or type
export class Variable {

    name: string;
    type: NodeType;
    value: any;

    constructor(name: string, type: NodeType, value: any) {
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
    isRunningOnServer: boolean = false;

    avalibleNodes: Catagory[] = [];

    // unused if no GUI is present
    Camera = {
        Position: { x: 0, y: 0 } as Vector2,
        Zoom: 1
    }

    constructor() {

        this.runtime.clearContext()

        let StartingNode = new StartNode();
        StartingNode._position = new Vector2(0, 0);
        this.addNode(StartingNode);

        this.loadDefaultNodes();

    }

    private loadCatagoryFile(filePath: string) {

        // load node file
        import( /* @vite-ignore */ filePath).then(module => {

            const catagor = module.default as Catagory;
            this.avalibleNodes.push(catagor);

        })

    }

    private loadDefaultNodes() {

        let cat: Catagory[] = Object.values(defaultNodes)

        cat.forEach(node => {
            this.avalibleNodes.push(node);
        })

    }

    addNode(node: Node) {
        this.allNodes.push(node);
        node.parentBlueprint = this
    }

    removeNode(node: Node) {

        if (node instanceof StartNode) return;

        this.allNodes = this.allNodes.filter(n => n != node);
        let inputs = node.inputs
        let outputs = node.outputs;
        this.allConnections = this.allConnections.filter(connection => !inputs.includes(connection.input) && !outputs.includes(connection.output));
    }

    connectNodes(input: Input, output: Output) {

        if (input == undefined || output == undefined) return

        // check if the output is already connected to something
        if (this.allConnections.some(connection => connection.input == input)) {
            throw new Error("Input is already connected to something")
        }

        // check if both the input and output are the same type
        if (input.type != output.type && (input.type != NodeTypes.Any && output.type != NodeTypes.Any)) {
            throw new Error("Input and output are not the same type")
        }

        if (input.type == NodeTypes.Signal && output.type != NodeTypes.Signal || input.type != NodeTypes.Signal && output.type == NodeTypes.Signal) {
            throw new Error("Input and output are not the same type")
        }

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
                if (input.type != NodeTypes.Signal) {
                    let connection = CurrentBlueprint.allConnections.find(connection => connection.input == inputs[i])!;
                    let inputNode = CurrentBlueprint.allNodes.find(node => node.outputs.includes(connection.output))!;
                    if (inputNode.linear == false) return;
                    // if the input node has any signal inputs or outputs stop the function
                    if (inputNode.inputs.some(input => input.type == NodeTypes.Signal) || inputNode.outputs.some(output => output.type == NodeTypes.Signal)) return;
                    await LookAtNode(inputNode);
                }
            })

            ExicutionOrder.push(node);

            if (node.linear == false) return;

            // get all outputs that are connected to the node
            node.outputs.forEach(async (output, i) => {
                if (output.type != NodeTypes.Signal) return;
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

        // check if there are any events in the current blueprint, if so we cant finish the blueprint because the events can be triggered at any time
        if (this.allNodes.some(node => node instanceof EventNode)) return;

        this._isRunning = false;

        console.log("Blueprint finished running")

    }

    async runThoughExicutionOrder(ExicutionOrder: Array<Node>) {

        for (let i = 0; i < ExicutionOrder.length; i++) {
            let node = ExicutionOrder[i];
            this.runtime.CurrentNode = node;
            await node.run(this.runtime);
            this.runtime.CurrentNode = null;
            if (this._isRunning == false) return;
        }

    }

    createVariable(name: string, type: NodeType, value: any): Variable {
        if (this.allVariables.some(variable => variable.name == name)) {
            throw new Error("Variable with name " + name + " already exists")
        }
        let vari = new Variable(name, type, value)
        this.allVariables.push(vari);
        return vari;
    }

    getVariable(name: string) {
        return this.allVariables.find(variable => variable.name == name);
    }

    loadBlueprint(serialized: serializedBlueprint) {


        let newBP = deserializeBlueprint(serialized);

        this.allNodes = newBP.allNodes;
        this.allConnections = newBP.allConnections;
        this.allVariables = newBP.allVariables;

        this.runtime.clearContext();

    }

    async triggerEvent(event: string, data: any[]) {

        if (!this._isRunning) {
            console.warn("Blueprint is not running")
            return;
        }

        let node: EventNode | undefined = this.allNodes.find(node => node.name === event && node instanceof EventNode) as EventNode

        if (node == undefined) {
            console.warn("No event with name " + event + " found")
            return;
        }

        node.setValues(data);

        let exOrder = await this.getNodeExicutionOrder(node);
        console.log(exOrder)
        await this.runThoughExicutionOrder(exOrder);

    }

}

interface OutputResult {

    OutputID: string;
    OutputValue: any;

}

export enum LogLevels {
    Info,
    Warning,
    Error
}

export class Log implements Log {

    LogValue: string;
    LoggedNode: Node;
    LoggedTime: number;
    LoggedLevel: LogLevels = LogLevels.Info;

    constructor(value: string, logLevel: LogLevels, node: Node) {
        this.LogValue = value;
        this.LoggedNode = node;
        this.LoggedTime = Date.now();
        this.LoggedLevel = logLevel;
    }

}

export class Runtime {

    OutputResults: Array<OutputResult> = [];
    CurrentNode: Node | null = null;

    CurrentVariables: Array<Variable> = [];

    RecordedLogs: Array<Log> = [];

    constructor() {

    }

    callBacks: Array<(log?: Log) => void> = [];
    clearContext() {
        this.OutputResults = [];
        this.CurrentVariables = [];
        this.CurrentNode = null;
        //this.RecordedLogs = [];

        this.callBacks.forEach(cb => cb());

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
        this.CurrentVariables.push({ name: name, type: NodeTypes.Any, value: value } as Variable);
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

    log(value: string, logLevel: LogLevels = LogLevels.Info, node: Node) {
        let log = new Log(value, logLevel, node)
        this.RecordedLogs = [...this.RecordedLogs, log]
        this.callBacks.forEach(cb => cb(log));
    }

    lissenForLog(cb: (log?: Log) => void) {

        this.callBacks.push(cb);

    }

}
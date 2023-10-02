import { Vector2 } from "./generics";
import { Blueprint, Runtime, Variable } from "./blueprint";
import { v4 as uuidv4 } from 'uuid';

export enum Types {

    Signal,
    Number,
    String,
    Boolean,
    Array,
    Vector2,
    Any

}

export enum TypeColors {

    "#ffffff",
    "#0AD2FF",
    "#2962FF",
    "#9500FF",
    "#FF0059",
    "#B4E600",
    "#FF8C00"

}

export class Input {

    name: string;
    type: Types;

    _id: string = uuidv4();

    constructor(name: string, type: Types) {
        this.name = name;
        this.type = type;
    }

}

export class Output extends Input {}

export class Connection {

    input: Input;
    output: Output;

    _id: string = uuidv4();

    constructor(input: Input, output: Output) {
        this.input = input;
        this.output = output;
    }


}

export abstract class Node {

    _position: Vector2 = Vector2.zero;
    _id: string = uuidv4();

    _width: number = 200;

    name: string = "Node <Generic>"
    inputs: Input[] = [];
    outputs: Output[] = [];

    linear: boolean = true; // set to false for things that have 2 signal outputs

    parentBlueprint: Blueprint | null = null;

    constructor() {
        this.inputs.push(new Input("Signal", Types.Signal));
        this.outputs.push(new Output("Signal", Types.Signal));
        this._position = new Vector2(0, 0);
    }

    addInput(name: string, type: Types) {
        this.inputs.push(new Input(name, type));
    }
    addOutput(name: string, type: Types) {
        this.outputs.push(new Output(name, type));
    }

    getInputs() {

        let inputValues: any = {};

        var start = window.performance.now();

        for (let i = 0; i < this.inputs.length; i++) {
            let input = this.inputs[i];

            if (input.type == Types.Signal) continue;

            //console.log(input)

            // if has connection
            if (this.parentBlueprint!.allConnections.some(connection => connection.input == input)) {
                let connection = this.parentBlueprint!.allConnections.find(connection => connection.input == input)!;
                let output = this.parentBlueprint!.runtime.getOutput(connection.output._id);
                if (output == null){
                    console.error("Output not set!, Somthings wrong here!!!!!")
                    inputValues[input.name] = null;
                } else {
                    inputValues[input.name] = output!.OutputValue;
                }
            } else {
                inputValues[input.name] = null;
            }

        }

        var end = window.performance.now();
        //console.log(`Rendered ${this.inputs.length} nodes, in ${end - start}ms`)

        return inputValues;

    }

    setOutput(Name: string, Value: any){

        if (this.parentBlueprint == null) throw new Error("Node is not in a blueprint!");
        if (!this.outputs.some(output => output.name == Name)) throw new Error("Output with name '" + Name + "' does not exist!");


        this.parentBlueprint.runtime.setOutput(this.outputs.find(output => output.name == Name)!._id, Value);

    }

    abstract run(runtime: Runtime): void;
    
}

export class GenericNode extends Node {

    name: string = "Generic Node"

    constructor() {
        super();
        this.inputs = [new Input("Signal", Types.Signal)];
        this.outputs = [new Output("Signal", Types.Signal)];
    }

    run(runtime: Runtime): void {
        this.setOutput("Signal", null);
    }

}

export class StartNode extends Node {
    name: string = "Start"
    _width: number = 100;
    constructor() {
        super();
        this.inputs = [];
        this.outputs = [new Output("Signal", Types.Signal)];
    }
    async run(runtime: Runtime): Promise<void> {
        this.setOutput("Signal", null);
    }
}

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

export class GetVariable extends Node {

    name: string = "Get Variable"

    thisVariable: Variable;

    constructor(variable: Variable) {
        super();
        this.inputs = [];
        console.log(this.parentBlueprint)
        this.outputs = [new Output("Value", variable.type)];
        this.name = variable.name;
        this.thisVariable = variable;
    }

    async run(runtime: Runtime): Promise<void> {

        if (this.parentBlueprint?.allVariables.find(vari => vari.name == this.thisVariable.name) == null) throw new Error("Variable is not in blueprint!")

        this.setOutput("Value", runtime.getVariable(this.thisVariable.name)?.value);

    }

}

export class SetVariable extends Node {

    name: string = "Set Variable"

    thisVariable: Variable;

    constructor(variable: Variable) {
        super();
        this.inputs = [new Output("Signal", Types.Signal), new Input("Value", variable.type)];
        this.outputs = [new Output("Signal", Types.Signal)];
        this.name = variable.name;
        this.thisVariable = variable;
    }

    async run(runtime: Runtime): Promise<void> {

        if (this.parentBlueprint?.allVariables.find(vari => vari.name == this.thisVariable.name) == null) throw new Error("Variable is not in blueprint!")

        let inputs = this.getInputs();

        let value = inputs["Value"];

        if (value == null) return;

        runtime.setVariable(this.thisVariable.name, value);

        this.setOutput("Signal", null);

    }

}
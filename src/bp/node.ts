import { Vector2 } from "./generics";
import { Blueprint, Runtime } from "./blueprint";
import { v4 as uuidv4 } from 'uuid';

export enum Types {

    Signal,
    Number,
    String,
    Boolean,
    Array,
    Vector2

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

        for (let i = 0; i < this.inputs.length; i++) {
            let input = this.inputs[i];

            if (input.type == Types.Signal) continue;

            //console.log(input)

            // if has connection
            if (this.parentBlueprint!.allConnections.some(connection => connection.input == input)) {
                let connection = this.parentBlueprint!.allConnections.find(connection => connection.input == input)!;
                let output = this.parentBlueprint!.runtime.getOutput(connection.output._id);
                //console.log(connection)
                inputValues[input.name] = output!.OutputValue;
            } else {
                inputValues[input.name] = null;
            }

        }

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
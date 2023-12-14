import Controll from './controll';
import Logic from './logic';
import Debug from './debug';
import Math from './maths';
import String from './string';
import { SetVariable, GetVariable, StartNode, GenericNode, Constant } from '../node';

interface NodeEntry {

    name: string
    node: typeof GenericNode

}

interface Catagory {

    name: string
    category: string
    description: string
    id: string
    colour: string

    nodes: NodeEntry[]

}

let Variables = {

    name: "Variables",
    category: "Core",
    description: "Variable nodes",
    id: "variables",
    colour: "#ff0000",

    nodes: [

        { name: "Set Variable", node: SetVariable },
        { name: "Get Variable", node: GetVariable }

    ]

}
let System = {

    name: "System",
    category: "Core",
    description: "System nodes",
    id: "system",
    colour: "#ff0000",

    hide: true,

    nodes: [

        { name: "Start", node: StartNode },
        { name: "Constant", node: Constant }

    ]

};

export { Controll, Logic, Debug, Variables, Math, String, System };
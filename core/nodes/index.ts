import Controll from './controll';
import Logic from './logic';
import Debug from './debug';
import Math from './maths';
import String from './string';
import { SetVariable, GetVariable, StartNode, GenericNode, Constant, EventNode } from '../node';

interface NodeEntry {

    name: string
    node: typeof GenericNode

}

export interface Catagory {

    name: string
    category: string
    description: string
    id: string
    colour: string

    hide?: boolean

    nodes: NodeEntry[]

}

let Variables = {
    name: "Variables",
    category: "Core",
    description: "Variable nodes",
    id: "variables",
    colour: "#ff0000",

    hide: true,

    nodes: [
        { name: "SetVariable", node: SetVariable },
        { name: "GetVariable", node: GetVariable }
    ]
} as unknown as Catagory

let System = {

    name: "System",
    category: "Core",
    description: "System nodes",
    id: "system",
    colour: "#ff0000",

    hide: true,

    nodes: [

        { name: "Start", node: StartNode },
        { name: "Constant", node: Constant },
        { name: "GenericNode", node: GenericNode },
        { name: "EventNode", node: EventNode }

    ]

} as Catagory

export { Controll, Logic, Debug, Variables, Math, String, System };
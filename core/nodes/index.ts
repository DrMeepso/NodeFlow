import * as Controll from './controll';
import * as Logic from './logic';
import * as Debug from './debug';
import * as Math from './maths';
import * as String from './string';
import { SetVariable, GetVariable } from '../node';
let Variables = {

    name: "Variables",
    category: "Core",
    description: "Variable nodes",
    id: "variables",
    colour: "#ff0000",

    nodes: [

        { name: "Set Variable", node: SetVariable },
        { name: "Get Variable", node: GetVariable },

    ]

};

export { Controll, Logic, Debug, Variables, Math, String };
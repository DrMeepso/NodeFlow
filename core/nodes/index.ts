import Controll from './controll';
import Logic from './logic';
import Debug from './debug';
import Math from './maths';
import String from './string';
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
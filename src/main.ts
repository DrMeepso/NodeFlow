import { Blueprint } from "./bp/blueprint";
import { Node, StartNode, Types, GenericNode, GetVariable, SetVariable } from "./bp/node";
import { RenderBlueprint } from "./GUI/render";
import { SetupUserInteractions } from "./GUI/userInteractions";
import { Vector2 } from "./bp/generics";

import { ForLoop, Wait } from "./bp/nodes/controll";
import { Equal, NotEqual } from "./bp/nodes/logic";
import { Log } from "./bp/nodes/debug";

const bp = new Blueprint();

let testVariable = bp.createVariable("Test Number", Types.Number, 0);

let getVari = new GetVariable(testVariable);
//bp.addNode(getVari);

let vectorTestVariable = bp.createVariable("Vector Test", Types.Vector2, new Vector2(15, 15));
let getVectorVari = new GetVariable(vectorTestVariable);
//bp.addNode(getVectorVari);

let setVectorVari = new SetVariable(testVariable);
//bp.addNode(setVectorVari);


SetupUserInteractions(bp);

setInterval(() => {

    RenderBlueprint(bp);

}, 1000 / 60)

declare global {

    interface Window {
        runExicutionOrder: () => void;
        runBlueprint: () => void;
        draggingInfo: any;
        mousePos: Vector2;
        rightClickMenu: any;
    }

}

window.runExicutionOrder = () => {

    console.log(bp.runBlueprint());

}
window.runBlueprint = () => {

    bp.runBlueprint();

}

window.draggingInfo = {

    isDragging: false,
    node: null,
    input: false,
    index: 0,

    isDraggingNode: false,

}

window.rightClickMenu = {

    open: false,
    position: new Vector2(0, 0),
    search: "",
    catagotys: [],
    selectedCatagory: null,
    nodes: [ForLoop, Equal, NotEqual, Wait, Log],

    width: 150,
    height: 300,

}
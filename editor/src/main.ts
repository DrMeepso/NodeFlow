//import { Blueprint } from "./bp/blueprint";
import { Node, StartNode, Types, GenericNode, Blueprint, Vector2, DefaultNodes } from "../../core/";
import { RenderBlueprint } from "./GUI/render";
import { SetupUserInteractions } from "./GUI/userInteractions";

const bp = new Blueprint();

let testVariable = bp.createVariable("Test Number", Types.Number, 0);

let getVari = new DefaultNodes.Variables.GetVariable(testVariable);
//bp.addNode(getVari);

let vectorTestVariable = bp.createVariable("Vector Test", Types.Vector2, new Vector2(15, 15));
let getVectorVari = new DefaultNodes.Variables.GetVariable(vectorTestVariable);
//bp.addNode(getVectorVari);

let setVectorVari = new DefaultNodes.Variables.SetVariable(testVariable);
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
    nodes: [DefaultNodes.Controll.ForLoop, DefaultNodes.Logic.Equal, DefaultNodes.Logic.NotEqual, DefaultNodes.Controll.Wait, DefaultNodes.Debug.Log],

    width: 150,
    height: 300,

}
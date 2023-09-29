import { Blueprint } from "./bp/blueprint";
import { Node, StartNode, Types } from "./bp/node";
import { RenderNode, GetCTX, GetCanvas, RenderConnection, RenderBlueprint } from "./render";
import { SetupUserInteractions } from "./userInteractions";
import { Vector2 } from "./bp/generics";

const bp = new Blueprint();

let StartingNode = new StartNode();
StartingNode._position = new Vector2(0, 0);
bp.addNode(StartingNode);

let constNumb = new Node();
constNumb.inputs = [];
constNumb.outputs = [];
constNumb.addOutput("10", Types.Number);
constNumb.addOutput("5", Types.Number);
constNumb.name = "Constant Number";
constNumb._position = new Vector2(100, 100);
constNumb.run = () => {

    constNumb.setOutput("10", 10);
    constNumb.setOutput("5", 5);

}
bp.addNode(constNumb);

let testNode2 = new Node();
testNode2.outputs = [];
testNode2.inputs = [];
testNode2.addInput("Number 1", Types.Number);
testNode2.addInput("Number 2", Types.Number);
testNode2.addOutput("Output 1", Types.Number);
testNode2.name = "Addition";
testNode2._position = new Vector2(500, 500);
testNode2.run = async () => {

    let inputs: any = testNode2.getInputs()

    let number1 = inputs["Number 1"];
    let number2 = inputs["Number 2"];

    testNode2.setOutput("Output 1", number1 + number2);

}
bp.addNode(testNode2);

let testNode3 = new Node();
testNode3.addInput("Number", Types.Number);
testNode3.name = "Log Number";
testNode3._position = new Vector2(500, 100);
testNode3.run = () => {

    let inputs: any = testNode3.getInputs()

    let number = inputs["Number"];

    console.log(number);

}
bp.addNode(testNode3);

SetupUserInteractions(bp);

setInterval(() => {

    RenderBlueprint(bp);

}, 1000 / 60)

declare global {

    interface Window {
        runExicutionOrder: () => void;
        runBlueprint: () => void;
    }

}

window.runExicutionOrder = () => {

    console.log(bp.getNodeExicutionOrder(StartingNode));

}
window.runBlueprint = () => {

    bp.runBlueprint();

}
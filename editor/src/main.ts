import Logs from './Svelte/Logs.svelte'
import ContextMenu from './Svelte/ContextMenu.svelte';
import { writable } from 'svelte/store'

//export default app

//import { Blueprint } from "./bp/blueprint";
import { Node, StartNode, Types, GenericNode, Blueprint, Vector2, DefaultNodes, Log } from "../../core/";
import { RenderBlueprint } from "./GUI/render";
import { SetupUserInteractions } from "./GUI/userInteractions";

const test: Log[] = []
const bp = new Blueprint();
bp.runtime.lissenForLog((log?: Log) => {
    logs.$set({ logs: bp.runtime.RecordedLogs })
})

const logs = new Logs({
    target: document.getElementById('logs')!,
    props: {
        height: 100,
        CurrentBlueprint: bp,
        logs: bp.runtime.RecordedLogs
    }
})

const context = new ContextMenu({

    target: document.body,
    props: {
        CurrentBlueprint: bp,
    }

})

let testVariable = bp.createVariable("Test Number", Types.Number, 0);

/*
let getVari = new DefaultNodes.Variables.GetVariable(testVariable);
//bp.addNode(getVari);

let vectorTestVariable = bp.createVariable("Vector Test", Types.Vector2, new Vector2(15, 15));
let getVectorVari = new DefaultNodes.Variables.GetVariable(vectorTestVariable);
//bp.addNode(getVectorVari);

let setVectorVari = new DefaultNodes.Variables.SetVariable(testVariable);
//bp.addNode(setVectorVari);
*/

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
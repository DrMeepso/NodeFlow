import Logs from './Svelte/Logs.svelte'
import ContextMenu from './Svelte/ContextMenu.svelte';
import { writable } from 'svelte/store'

import { Node, StartNode, Types, GenericNode, Blueprint, Vector2, DefaultNodes, Log } from "../../core/";
import { RenderBlueprint } from "./GUI/render";
import { SetupUserInteractions } from "./GUI/userInteractions";
import { EventNode, Output } from '../../core/node';

const bp = new Blueprint();
bp.runtime.lissenForLog((log?: Log) => {
    logs.$set({ logs: bp.runtime.RecordedLogs })
})

const testEvent = new EventNode("onTest", [
    new Output("testValue", Types.String)
])

bp.addNode(testEvent);

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

SetupUserInteractions(bp);

setInterval(() => {

    RenderBlueprint(bp);

}, 1000 / 60)

declare global {

    interface Window {
        runExicutionOrder: () => void;
        runBlueprint: () => void;
        serializeBlueprint: () => void;
        reSerializeBlueprint: () => void;
        draggingInfo: any;
        mousePos: Vector2;
        rightClickMenu: any;
        blueprint: Blueprint;
    }

}

window.blueprint = bp;

window.runExicutionOrder = () => {

    bp.triggerEvent("onTest", [ "Hello World!" ]);

}

window.runBlueprint = () => {

    bp.runBlueprint();

}

import { serializeBlueprint } from "../../core/serialization";
window.serializeBlueprint = () => {

    return serializeBlueprint(bp)

}

window.reSerializeBlueprint = () => {

    let serializedBlueprint = serializeBlueprint(bp);
    bp.loadBlueprint(serializedBlueprint);

}

window.draggingInfo = {

    isDragging: false,
    node: null,
    input: false,
    index: 0,

    isDraggingNode: false,

}
/*
This file is from a previous node project of mine
It needs to be cleaned up and rewritten
*/

import { Blueprint, Node, GenericNode, Vector2, Output, Types, Connection } from "../../../core"
import { GetMouseCollitions } from "./render";

function Distance(a: Vector2, b: Vector2) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function SetupUserInteractions(CurrentBlueprint: Blueprint) {

    const BlueprintCamera = CurrentBlueprint.Camera;

    enum MouseInputType {
        None,
        DraggingNode,
        DraggingConnection,
        MovingCamera
    }

    var MouseInput: MouseInputType = MouseInputType.None;
    var MousePos: Vector2 = Vector2.zero;

    var SelectedNode: Node | null = null;
    var Offset: Vector2 = Vector2.zero;

    var SelectedInput: number = -1;
    var SelectedOutput: number = -1;

    const Canvas = document.getElementById("canvas") as HTMLCanvasElement;

    Canvas.addEventListener("mousedown", (e) => {

        e.preventDefault();

        // check for left click
        if (e.button == 0) {
            // check if the mouse is on a node

            let collitions = GetMouseCollitions(CurrentBlueprint);
            let headerCollision = collitions.find(collition => collition.type == 1);

            if (headerCollision) {

                MouseInput = MouseInputType.DraggingNode;
                window.draggingInfo.isDraggingNode = true;
                window.draggingInfo.node = headerCollision.victum;

                SelectedNode = headerCollision.victum;
                Offset.x = e.x - headerCollision.victum._position.x;
                Offset.y = e.y - headerCollision.victum._position.y;

            }

            let portCollision = collitions.find(collition => collition.type == 3 || collition.type == 2);

            if (portCollision) {

                let port = portCollision.victumPort!
                let portIndex = portCollision.victumPortIndex!

                SelectedInput = portCollision.type == 3 ? -1 : portIndex;
                SelectedOutput = portCollision.type == 4 ? -1 : portIndex;
                SelectedNode = portCollision.victum;

                MouseInput = MouseInputType.DraggingConnection;

                window.draggingInfo.isDragging = true;  
                window.draggingInfo.node = portCollision.victum;
                window.draggingInfo.input =  portCollision.type == 3 ? false : true;
                window.draggingInfo.index = portIndex

            }

        } else if (e.button == 2) {

            let collitions = GetMouseCollitions(CurrentBlueprint);
            let collition = collitions.find(collition => collition.type == 3 || collition.type == 2);

            if (collition) {

                // remove any connections that are connected to the connection
                let connections = CurrentBlueprint.allConnections.filter(connection => connection.input == collition?.victumPort || connection.output == collition?.victumPort);

                CurrentBlueprint.allConnections = CurrentBlueprint.allConnections.filter(connection => !connections.includes(connection));

            }

        } else if (e.button == 1) {
            // middle mouse button
            MouseInput = MouseInputType.MovingCamera;
        }

    })

    Canvas.addEventListener("mousemove", (e) => {

        if (SelectedNode != null && MouseInput == MouseInputType.DraggingNode) {
            SelectedNode._position = { x: e.x + BlueprintCamera.Position.x, y: e.y + BlueprintCamera.Position.y } as Vector2;
        }

        if (MouseInput == MouseInputType.MovingCamera) {
            BlueprintCamera.Position.x += (MousePos.x - e.x) * (1 / BlueprintCamera.Zoom)
            BlueprintCamera.Position.y += (MousePos.y - e.y) * (1 / BlueprintCamera.Zoom)
        }

        MousePos.x = e.x;
        MousePos.y = e.y;

        window.mousePos = MousePos;

    })

    Canvas.addEventListener("mouseup", (e) => {

        MouseInput = MouseInputType.None;

        const Canvas = document.getElementById("canvas") as HTMLCanvasElement;


        if (window.draggingInfo.isDraggingNode) {

            let TrashPos = new Vector2(Canvas.width - 50 + 25, 2 + 25);

            if (Distance(MousePos, TrashPos) < 25) {
                // remove the node
                CurrentBlueprint.removeNode(window.draggingInfo.node);
            }

        }

        window.draggingInfo.isDragging = false;
        window.draggingInfo.isDraggingNode = false;
        window.draggingInfo.node = null;

        const collitions = GetMouseCollitions(CurrentBlueprint);

        // check if we where holding a input / output if we were over a input / output
        if (SelectedInput != -1) {

            // check if we where droped on a output
            let portCollision = collitions.find(collition => collition.type == 3);

            let input = SelectedNode!.inputs[SelectedInput];

            CurrentBlueprint.connectNodes(input, portCollision?.victumPort!);

            SelectedInput = -1;


        } else if (SelectedOutput != -1) {

            // check if we where droped on a input
            let portCollision = collitions.find(collition => collition.type == 2);

            let output = SelectedNode!.outputs[SelectedOutput];

            CurrentBlueprint.connectNodes(portCollision?.victumPort!, output);

            SelectedOutput = -1;

        }

        if (CurrentBlueprint._isRunning) {

            let PausePos = new Vector2((Canvas.width / 2) - (150 - 15), 15);
            let StopPos = new Vector2((Canvas.width / 2) - (150 + 15), 15);

            if (Distance(MousePos, PausePos) < 15) {

                //console.log("Pause");

            } else if (Distance(MousePos, StopPos) < 15) {

                //console.log("Stop");

            }

        } else {

            let PlayPos = new Vector2((Canvas.width / 2) - (150), 15);

            if (Distance(MousePos, PlayPos) < 15) {

                //console.log("Play");

                CurrentBlueprint.runBlueprint();

            }

        }

        SelectedNode = null;

    })

    Canvas.addEventListener("wheel", (e) => {

        if (e.deltaY > 0) {
            //BlueprintCamera.Zoom *= 1.1;
        } else {
            //BlueprintCamera.Zoom *= 0.9;
        }

    })

    document.addEventListener("keydown", (e) => {

        if (e.key == "Control") {
            BlueprintCamera.Zoom = 1;
        }

    })

}
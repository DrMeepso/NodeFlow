/*
This file is from a previous node project of mine
It needs to be cleaned up and rewritten
*/

import { Blueprint } from "../bp/blueprint";
import { Vector2 } from "../bp/generics";
import { Connection, Node, Types } from "../bp/node";

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

    document.oncontextmenu = function () {
        return false;
    }

    document.addEventListener("mousedown", (e) => {

        e.preventDefault();

        // check for left click
        if (e.button == 0) {
            // check if the mouse is on a node

            CurrentBlueprint.allNodes.forEach(node => {
                // if the mouse is on the header
                if (e.x > (node._position.x - BlueprintCamera.Position.x) && e.x < (node._position.x - BlueprintCamera.Position.x) + node._width && e.y > (node._position.y - BlueprintCamera.Position.y) && e.y < (node._position.y - BlueprintCamera.Position.y) + 20) {
                    SelectedNode = node;
                    Offset.x = e.x - node._position.x;
                    Offset.y = e.y - node._position.y;


                    MouseInput = MouseInputType.DraggingNode;
                }

                // if is over a input / output
                for (let i = 0; i < node.inputs.length; i++) {
                    let CircleX = node._position.x + 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        SelectedInput = i;
                        SelectedOutput = -1;
                        SelectedNode = node;


                        MouseInput = MouseInputType.DraggingConnection;

                        window.draggingInfo.isDragging = true;
                        window.draggingInfo.node = node;
                        window.draggingInfo.input = true;
                        window.draggingInfo.index = i;

                    }

                }

                for (let i = 0; i < node.outputs.length; i++) {
                    let CircleX = node._position.x + node._width - 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        SelectedInput = -1;
                        SelectedOutput = i;
                        SelectedNode = node;

                        MouseInput = MouseInputType.DraggingConnection;

                        window.draggingInfo.isDragging = true;
                        window.draggingInfo.node = node;
                        window.draggingInfo.input = false;
                        window.draggingInfo.index = i;

                    }

                }

            })
        } else if (e.button == 2) {

            // when you right click a input or output, remove the connection
            CurrentBlueprint.allNodes.forEach(node => {


                for (let i = 0; i < node.inputs.length; i++) {
                    let CircleX = node._position.x + 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        let Con = CurrentBlueprint.allConnections.find(x => x.input == node.inputs[i]);
                        if (Con != null) {
                            CurrentBlueprint.allConnections.splice(CurrentBlueprint.allConnections.indexOf(Con), 1);
                        }

                        SelectedInput = -1;
                        SelectedOutput = -1;

                    }

                }

                for (let i = 0; i < node.outputs.length; i++) {
                    let CircleX = node._position.x + node._width - 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        let Cons = CurrentBlueprint.allConnections.filter(x => x.output == node.outputs[i]);
                        if (Cons != null) {
                            Cons.forEach(con => {
                                CurrentBlueprint.allConnections.splice(CurrentBlueprint.allConnections.indexOf(con), 1);
                            })
                        }

                        SelectedInput = -1;
                        SelectedOutput = -1;

                    }

                }

            })

        } else if (e.button == 1) {
            // middle mouse button
            MouseInput = MouseInputType.MovingCamera;
        }

    })

    document.addEventListener("mousemove", (e) => {

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

    document.addEventListener("mouseup", (e) => {

        MouseInput = MouseInputType.None;

        window.draggingInfo.isDragging = false;
        window.draggingInfo.node = null;

        // check if we where holding a input / output if we were over a input / output
        if (SelectedInput != -1) {

            // check if we where droped on a output
            CurrentBlueprint.allNodes.forEach(node => {
                for (let i = 0; i < node.outputs.length; i++) {
                    let CircleX = node._position.x + node._width - 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        // check if the types match
                        if (node.outputs[i].type == SelectedNode!.inputs[SelectedInput].type || SelectedNode!.inputs[SelectedInput].type == Types.Any) {

                            let Input = SelectedNode!.inputs[SelectedInput];
                            let Output = node.outputs[i];

                            let NConnection = {} as Connection;

                            NConnection.input = Input;
                            NConnection.output = Output;


                            // check if input is already connected
                            let Inputed = CurrentBlueprint.allConnections.filter(connection => connection.input == Input).length > 0;
                            if (Inputed) {
                                console.log("Input is already connected");
                                return;
                            }

                            if (node.outputs[i].type == Types.Signal) {
                                // check if output is already connected
                                let Outputed = CurrentBlueprint.allConnections.filter(connection => connection.output == Output).length > 0;
                                if (Outputed) {
                                    console.log("Output is already connected");
                                    return;
                                }
                            }

                            // get the blueprint
                            let Blueprint = node.parentBlueprint!;
                            Blueprint.allConnections.push(NConnection);


                        }

                    }

                }
            })

        } else if (SelectedOutput != -1) {

            // check if we where droped on a input
            CurrentBlueprint.allNodes.forEach(node => {
                for (let i = 0; i < node.inputs.length; i++) {
                    let CircleX = node._position.x + 15;
                    let CircleY = node._position.y + 40 + (i * 20);

                    if (Distance({ x: e.x, y: e.y } as Vector2, { x: CircleX - BlueprintCamera.Position.x, y: CircleY - BlueprintCamera.Position.y } as Vector2) < 13) {

                        // check if the types match
                        if (node.inputs[i].type == SelectedNode!.outputs[SelectedOutput].type || node.inputs[i].type == Types.Any) {

                            let Input = node.inputs[i];
                            let Output = SelectedNode!.outputs[SelectedOutput];

                            let NConnection = {} as Connection;

                            NConnection.input = Input;
                            NConnection.output = Output;


                            // check if input is already connected
                            let Inputed = CurrentBlueprint.allConnections.filter(connection => connection.input == Input).length > 0;
                            if (Inputed) {
                                console.log("Input is already connected");
                                return;
                            }

                            if (node.inputs[i].type == Types.Signal) {
                                // check if output is already connected
                                let Outputed = CurrentBlueprint.allConnections.filter(connection => connection.output == Output).length > 0;
                                if (Outputed) {
                                    console.log("Output is already connected");
                                    return;
                                }
                            }

                            // get the blueprint
                            let Blueprint = node.parentBlueprint!;
                            Blueprint.allConnections.push(NConnection);

                        }

                    }

                }

            })

        }

        const Canvas = document.getElementById("canvas") as HTMLCanvasElement;

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

    document.addEventListener("wheel", (e) => {

        if (e.deltaY > 0) {
            //BlueprintCamera.Zoom *= 1.1;
        } else {
            //BlueprintCamera.Zoom *= 0.9;
        }

    })

}
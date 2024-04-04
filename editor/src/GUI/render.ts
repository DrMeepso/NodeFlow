/*
This file is from a previous node project of mine
It needs to be cleaned up and rewritten
*/

import { Blueprint, Vector2, Node, Connection, NodeTypes, Input, Output } from "../../../core"

const Canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = Canvas.getContext("2d") as CanvasRenderingContext2D;

// This shouldnt work but it does so im not complaining
function ResizeCanvas() {
    Canvas.width = Canvas.clientWidth;
    Canvas.height = Canvas.clientHeight;
}
ResizeCanvas();
window.addEventListener("resize", ResizeCanvas);

const Images: any = {}
function LoadImageFromURL(url: string, key: string) {

    let img = new Image();
    img.onload = () => {
        Images[key] = img;
    }
    img.src = url;

}

LoadImageFromURL("./src/GUI/imgs/player-pause.svg", "pause");
LoadImageFromURL("./src/GUI/imgs/player-play.svg", "play");
LoadImageFromURL("./src/GUI/imgs/player-stop.svg", "stop");

LoadImageFromURL("./src/GUI/imgs/InputOutput.svg", "plug");

LoadImageFromURL("./src/GUI/imgs/trash-solid.svg", "trash");

export function RenderBlueprint(bp: Blueprint) {

    ResizeCanvas();

    // clear the canvas
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);

    // render the background as a light grey
    ctx.fillStyle = "#5e5e5e";
    ctx.fillRect(0, 0, Canvas.width, Canvas.height);

    ctx.save();

    // make the backgroud a infinite grid
    ctx.translate((-(bp.Camera.Position.x) % 50) - 50, (-(bp.Camera.Position.y) % 50) - 50);
    ctx.scale(bp.Camera.Zoom, bp.Camera.Zoom);
    ctx.strokeStyle = "#00000022";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < Canvas.width / bp.Camera.Zoom; x += 25) {
        ctx.moveTo(x * 2, 0);
        ctx.lineTo(x * 2, Canvas.height / bp.Camera.Zoom + 150);
    }
    for (let y = 0; y < (Canvas.height / bp.Camera.Zoom) + 150; y += 25) {
        ctx.moveTo(0, y * 2);
        ctx.lineTo(Canvas.width / bp.Camera.Zoom + 150, y * 2);
    }
    ctx.stroke();

    ctx.restore();
    ctx.save();

    ctx.translate(-bp.Camera.Position.x, -bp.Camera.Position.y);
    ctx.scale(bp.Camera.Zoom, bp.Camera.Zoom);

    // render all connections
    bp.allConnections.forEach(connection => {
        RenderConnection(connection, bp);
    })

    // render the dragged connection
    if (window.draggingInfo.isDragging) {

        let inNode = window.draggingInfo.node;
        let mousePos = window.mousePos;
        mousePos = window.mousePos.add(bp.Camera.Position as Vector2)

        let HoleList = window.draggingInfo.input ? inNode.inputs : inNode.outputs;
        let Hole = HoleList[window.draggingInfo.index];

        ctx.strokeStyle = Hole.type.color;
        ctx.lineWidth = 5;

        let x = inNode._position.x + 15;
        if (!window.draggingInfo.input) x += inNode._width - 30;

        let Start = { x: x, y: inNode._position.y + 40 + (window.draggingInfo.index * 20) } as Vector2;

        ctx.beginPath();

        // bezier curve
        ctx.moveTo(Start.x, Start.y);
        if (Start.x < mousePos.x) {
            ctx.bezierCurveTo(Start.x + 50, Start.y, mousePos.x - 50, mousePos.y, mousePos.x, mousePos.y);
        } else {
            ctx.bezierCurveTo(Start.x - 50, Start.y, mousePos.x + 50, mousePos.y, mousePos.x, mousePos.y);
        }

        // round the end of the line
        ctx.lineCap = "round";


        ctx.stroke();

    }

    // render all nodes
    bp.allNodes.forEach(node => {
        RenderNode(node);
    });

    ctx.restore();

    if (bp._isRunning) {
        // draw blue box around viewport
        ctx.strokeStyle = "#A8E4EEbb";
        ctx.lineWidth = 15;
        ctx.strokeRect(0, 0, Canvas.width, Canvas.height);
    }

    // render a small island at the top of the screen containing the name of the blueprint
    ctx.fillStyle = "#00000077";
    ctx.beginPath();
    ctx.roundRect((Canvas.width / 2) - 100, 0, 200, 50, [0, 0, 10, 10]);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(bp.name, Canvas.width / 2, 30);

    // File Options Menu
    ctx.fillStyle = "#00000077";
    ctx.beginPath();
    ctx.roundRect((Canvas.width / 2) + 100, 0, 100, 40, [0, 0, 10, 0]);
    ctx.fill();

    // Run Options Menu
    ctx.fillStyle = "#00000077";
    ctx.beginPath();
    ctx.roundRect((Canvas.width / 2) - 100, 0, -100, 40, [0, 0, 10, 0]);
    ctx.fill();

    if (bp._isRunning) {

        ctx.drawImage(Images.pause, (Canvas.width / 2) - 150, 5, 30, 30);
        ctx.drawImage(Images.stop, (Canvas.width / 2) - (150 + 30), 5, 30, 30);

    } else {

        ctx.drawImage(Images.play, (Canvas.width / 2) - (150 + 15), 5, 30, 30);

    }

    // write in semi transparent text
    ctx.fillStyle = "#ffffff77";
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(bp.Camera.Position.x)}, ${Math.round(bp.Camera.Position.y)}`, Canvas.width - 10, Canvas.height - 10);

    let TrashPos = new Vector2(Canvas.width - 50 + 25, 2 + 25);

    if (window.draggingInfo.isDraggingNode) {

        if (window.mousePos.distance(TrashPos) < 25) {

            ctx.globalAlpha = 1;
            ctx.drawImage(Images.trash, Canvas.width - 50, 2, 50, 50);
            ctx.globalAlpha = 1;

        } else {

            ctx.globalAlpha = 0.5;
            ctx.drawImage(Images.trash, Canvas.width - 50, 2, 50, 50);
            ctx.globalAlpha = 1;

        }
    }

}

export function RenderNode(node: Node) {

    let NodeHeight = 30 + ((node.inputs.length > node.outputs.length ? node.inputs.length : node.outputs.length) * 20)
    let NodeWidth = node._width;

    let headerHeight = 20;
    //let bottomPadding = 10;

    // render header
    ctx.fillStyle = "#212121"
    // make top corners rounded
    ctx.beginPath();
    ctx.moveTo(node._position.x, node._position.y + 10);
    ctx.lineTo(node._position.x, node._position.y + headerHeight);
    ctx.lineTo(node._position.x + NodeWidth, node._position.y + headerHeight);
    ctx.lineTo(node._position.x + NodeWidth, node._position.y + 10);
    ctx.arcTo(node._position.x + NodeWidth, node._position.y, node._position.x + NodeWidth - 10, node._position.y, 10);
    ctx.lineTo(node._position.x + 10, node._position.y);
    ctx.arcTo(node._position.x, node._position.y, node._position.x, node._position.y + 10, 10);
    ctx.fill();
    // render header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(node.name, (node._position.x + NodeWidth / 2), node._position.y + headerHeight / 2 + 7);

    // render body
    ctx.fillStyle = "#00000077";
    // make bottom corners rounded
    ctx.beginPath();
    ctx.moveTo(node._position.x, node._position.y + headerHeight + NodeHeight);
    ctx.lineTo(node._position.x, node._position.y + headerHeight);
    ctx.lineTo(node._position.x + NodeWidth, node._position.y + headerHeight);
    ctx.arcTo(node._position.x + NodeWidth, node._position.y + headerHeight + NodeHeight, node._position.x + NodeWidth - 10, node._position.y + headerHeight + NodeHeight, 10);
    ctx.lineTo(node._position.x + 10, node._position.y + headerHeight + NodeHeight);
    ctx.arcTo(node._position.x, node._position.y + headerHeight + NodeHeight, node._position.x, node._position.y + headerHeight + NodeHeight - 10, 10);
    ctx.fill();

    // render inputs
    for (let i = 0; i < node.inputs.length; i++) {
        // draw a circle for each input
        ctx.fillStyle = node.inputs[i].type.color;
        if (node.inputs[i].type != NodeTypes.Signal) {

            if (node.inputs[i].type == NodeTypes.Any) {

                // make circle a square
                ctx.beginPath();
                ctx.roundRect(node._position.x + 16 / 2, node._position.y + headerHeight + 20 + (i * 20) - 8, 16, 16, [5, 5, 5, 5]);
                ctx.fill();

            } else {

                ctx.beginPath();
                ctx.arc(node._position.x + 15, node._position.y + headerHeight + 20 + (i * 20), 8, 0, 2 * Math.PI);
                ctx.fill();

            }

        } else {
            ctx.drawImage(Images.plug, node._position.x + 2, node._position.y + headerHeight + 20 + (i * 20) - (25 / 2), 25, 25);
        }

        // draw the input name
        ctx.fillStyle = "#ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(node.inputs[i].name, node._position.x + 30, node._position.y + headerHeight + 20 + (i * 20) + 5);
    }

    // render outputs
    for (let i = 0; i < node.outputs.length; i++) {
        // draw a circle for each output
        ctx.fillStyle = node.outputs[i].type.color;
        if (node.outputs[i].type != NodeTypes.Signal) {
            ctx.beginPath();
            ctx.arc(node._position.x + NodeWidth - 17, node._position.y + headerHeight + 20 + (i * 20), 8, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.drawImage(Images.plug, node._position.x + NodeWidth - 30, node._position.y + headerHeight + 20 + (i * 20) - (25 / 2), 25, 25);
        }

        // draw the output name
        ctx.fillStyle = "#ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "right";
        ctx.fillText(node.outputs[i].name, node._position.x + NodeWidth - 30, node._position.y + headerHeight + 20 + (i * 20) + 5);
    }

    if (node.parentBlueprint?._isRunning && node.parentBlueprint.runtime.CurrentNode == node) {

        ctx.strokeStyle = "#A8E4EEbb";
        ctx.lineWidth = 5;
        // round the end of the line
        ctx.beginPath();
        ctx.roundRect(node._position.x, node._position.y, NodeWidth, NodeHeight + 20, [10, 10, 10, 10]);
        ctx.stroke();

    }

}

export function RenderConnection(Conn: Connection, parentBlueprint: Blueprint) {

    // use a bezier curve to draw the connection
    // make sure there is a straightline for the first 20% and last 20% of the curve
    // this makes it look like the connection is coming out of the circle

    // check if the the Start x is smaller than the End x
    // if so, the Start x is the left side of the circle
    // otherwise the End x is the left side of the circle

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;

    let Nodes = parentBlueprint.getNodesFromConnection(Conn);

    if (Nodes.In == null || Nodes.Out == null) return;

    let Start = { x: Nodes.In._position.x + 15, y: Nodes.In._position.y + 40 + (Nodes.In.inputs.findIndex(input => input == Conn.input) * 20) } as Vector2;
    let End = { x: Nodes.Out._position.x + Nodes.Out._width - 15, y: Nodes.Out._position.y + 40 + (Nodes.Out.outputs.findIndex(output => output == Conn.output) * 20) } as Vector2;

    let StartIsLeft = Start.x < End.x;

    // make the strokestyle a gradient between the 2 colors
    let gradient = ctx.createLinearGradient(Start.x, Start.y, End.x, End.y);
    gradient.addColorStop(0.1, Conn.input.type.color);
    gradient.addColorStop(0.9, Conn.output.type.color);

    ctx.strokeStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(Start.x, Start.y);
    if (StartIsLeft) {
        ctx.bezierCurveTo(Start.x + 50, Start.y, End.x - 50, End.y, End.x, End.y);
    } else {
        ctx.bezierCurveTo(Start.x - 50, Start.y, End.x + 50, End.y, End.x, End.y);
    }
    // round the end of the line
    ctx.lineCap = "round";
    ctx.stroke();
}
export function GetCTX(): CanvasRenderingContext2D {
    return ctx;
}
export function GetCanvas(): HTMLCanvasElement {
    return Canvas;
}

enum MouseCollitionNodeTypes {

    Node,
    NodeHeader,
    Input,
    Output,
    None

}

interface MouseCollitions {

    position: Vector2;
    type: MouseCollitionNodeTypes
    victum: any;
    victumPort?: Input | Output | null;
    victumPortIndex?: number;

}

export function GetMouseCollitions(ThisBlueprint: Blueprint): Array<MouseCollitions> {

    let collitions: Array<MouseCollitions> = []

    let MousePos = new Vector2(window.mousePos.x, window.mousePos.y).add(ThisBlueprint.Camera.Position as Vector2);

    function GetInputOutputPosition(port: Input | Output, ParentNode: Node): Vector2 {

        let Node = ParentNode;

        if (Node == null) return Vector2.zero;

        let index = Node.inputs.findIndex(input => input == port);
        if (index == -1) index = Node.outputs.findIndex(output => output == port);

        let x = Node._position.x + (port instanceof Output ? Node._width - 15 : 15)

        return new Vector2(x, Node._position.y + 40 + (index * 20));

    }

    for (let i = 0; i < ThisBlueprint.allNodes.length; i++) {

        let ThisNode = ThisBlueprint.allNodes[i];

        let NodePos = ThisNode._position;

        let NodeHeight = 30 + ((ThisNode.inputs.length > ThisNode.outputs.length ? ThisNode.inputs.length : ThisNode.outputs.length) * 20)

        // check for a collition with the node
        if (MousePos.x > NodePos.x && MousePos.x < NodePos.x + ThisNode._width && MousePos.y > NodePos.y && MousePos.y < NodePos.y + NodeHeight) {

            collitions.push({ position: NodePos, type: MouseCollitionNodeTypes.Node, victum: ThisNode });

        }

        // check for a collition with the node header
        if (MousePos.x > NodePos.x && MousePos.x < NodePos.x + ThisNode._width && MousePos.y > NodePos.y && MousePos.y < NodePos.y + 20) {

            collitions.push({ position: NodePos, type: MouseCollitionNodeTypes.NodeHeader, victum: ThisNode });

        }

        // check for a collition with the inputs
        for (let j = 0; j < ThisNode.inputs.length; j++) {

            let InputPos = GetInputOutputPosition(ThisNode.inputs[j], ThisNode);

            if (MousePos.distance(InputPos) < 8) {

                collitions.push({ position: InputPos, type: MouseCollitionNodeTypes.Input, victum: ThisNode, victumPort: ThisNode.inputs[j], victumPortIndex: j });

            }

        }

        // check for a collition with the outputs
        for (let j = 0; j < ThisNode.outputs.length; j++) {

            let OutputPos = GetInputOutputPosition(ThisNode.outputs[j], ThisNode);

            if (MousePos.distance(OutputPos) < 8) {

                collitions.push({ position: OutputPos, type: MouseCollitionNodeTypes.Output, victum: ThisNode, victumPort: ThisNode.outputs[j], victumPortIndex: j });

            }

        }

    }

    return collitions

}
import { Blueprint } from "../bp/blueprint";
import { Vector2 } from "../bp/generics";
import { Node, Connection, Types, TypeColors } from "../bp/node";

const Canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = Canvas.getContext("2d") as CanvasRenderingContext2D;

// This shouldnt work but it does so im not complaining
function ResizeCanvas() {
    Canvas.width = window.innerWidth;
    Canvas.height = window.innerHeight;
}
ResizeCanvas();
window.addEventListener("resize", ResizeCanvas);

export function RenderBlueprint(bp: Blueprint) {

    // clear the canvas
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);

    // render the background as a light grey
    ctx.fillStyle = "#5e5e5e";
    ctx.fillRect(0, 0, Canvas.width, Canvas.height);

    // render all nodes
    bp.allNodes.forEach(node => {
        RenderNode(node);
    });

    // render all connections
    bp.allConnections.forEach(connection => {
        RenderConnection(connection, bp);
    })

    if (bp._isRunning) {
        // draw blue box around viewport
        ctx.strokeStyle = "#0000ff";
        ctx.lineWidth = 5;
        ctx.strokeRect(bp.Camera.Position.x, bp.Camera.Position.y, Canvas.width / bp.Camera.Zoom, Canvas.height / bp.Camera.Zoom);
    }

}

export function RenderNode(node: Node) {

    let NodeHeight = 30 + ((node.inputs.length > node.outputs.length ? node.inputs.length : node.outputs.length) * 20)
    let NodeWidth = node._width;

    let headerHeight = 20;
    //let bottomPadding = 10;

    // render header
    ctx.fillStyle = "#000000"
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
        ctx.fillStyle = TypeColors[node.inputs[i].type];
        ctx.beginPath();
        ctx.arc(node._position.x + 15, node._position.y + headerHeight + 20 + (i * 20), 8, 0, 2 * Math.PI);
        ctx.fill();

        // draw the input name
        ctx.fillStyle = "#ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(node.inputs[i].name, node._position.x + 30, node._position.y + headerHeight + 20 + (i * 20) + 5);
    }

    // render outputs
    for (let i = 0; i < node.outputs.length; i++) {
        // draw a circle for each output
        ctx.fillStyle = TypeColors[node.outputs[i].type];
        ctx.beginPath();
        ctx.arc(node._position.x + NodeWidth - 15, node._position.y + headerHeight + 20 + (i * 20), 8, 0, 2 * Math.PI);
        ctx.fill();

        // draw the output name
        ctx.fillStyle = "#ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "right";
        ctx.fillText(node.outputs[i].name, node._position.x + NodeWidth - 30, node._position.y + headerHeight + 20 + (i * 20) + 5);
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
    gradient.addColorStop(0, TypeColors[Conn.output.type]);
    gradient.addColorStop(1, TypeColors[Conn.input.type]);

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

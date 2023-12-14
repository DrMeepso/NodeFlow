import {Blueprint} from "./blueprint";
import { Node, Connection, Input, Output, DefaultNodes, GenericNode, Vector2 } from ".";


interface NodeInstance {

    classID: string;
    nodeID: string;
    position: { x: number, y: number };
    customData: any;

}

interface Port {

    parentNode: string;
    portIndex: number;

}

interface ConnectionInstance {

    input: Port;
    output: Port;

}

export interface serializedBlueprint {

    nodes: NodeInstance[];
    connections: ConnectionInstance[];
    name: string;

}

export function serializeBlueprint(BP: Blueprint){

    const serialized: serializedBlueprint = {

        nodes: [],
        connections: [],
        name: BP.name

    }

    BP.allNodes.forEach(node => {

        let ParentCatagory = Object.values(DefaultNodes).find(catagory => catagory.nodes.find(n => node instanceof n.node));
        let ParentClass = ParentCatagory?.nodes.find(n => node instanceof n.node);

        let classID = ParentCatagory?.id +"."+ ParentClass?.name
        let nodeID = node._id

        let instance: NodeInstance = {

            classID: classID!,
            nodeID: nodeID!,
            position: node._position,
            customData: node.nodeCustomData

        }

        serialized.nodes.push(instance);

    })

    BP.allConnections.forEach(connection => {

        let input = connection.input;
        let output = connection.output;

        let Nodes = BP.getNodesFromConnection(connection);

        let inputPort: Port = {

            parentNode: Nodes.In!._id,
            portIndex: Nodes.In!.inputs.indexOf(input)

        }

        let outputPort: Port = {

            parentNode: Nodes.Out!._id,
            portIndex: Nodes.Out!.outputs.indexOf(output)

        }

        let instance: ConnectionInstance = {

            input: inputPort,
            output: outputPort

        }

        serialized.connections.push(instance);

    })

    return serialized;

}

export function deserializeBlueprint(serialized: serializedBlueprint){

    let BP = new Blueprint();

    let nodes: Node[] = [];
    let connections: Connection[] = [];

    serialized.nodes.forEach(node => {

        let ParentCatagory = Object.values(DefaultNodes).find(catagory => catagory.nodes.find(n => node.classID.split(".")[1] == n.name));
        let ParentClass = ParentCatagory?.nodes.find(n => node.classID.split(".")[1] == n.name);

        if (ParentClass == undefined) throw new Error("Node class '" + node.classID + "' does not exist!");

        let instance = new ParentClass.node(node.customData);

        instance._id = node.nodeID;
        instance._position = new Vector2(node.position.x, node.position.y);
        instance.parentBlueprint = BP;

        nodes.push(instance);

    })

    serialized.connections.forEach(connection => {

        let input = nodes.find(n => n._id == connection.input.parentNode)?.inputs[connection.input.portIndex];
        let output = nodes.find(n => n._id == connection.output.parentNode)?.outputs[connection.output.portIndex];

        let instance = new Connection(input!, output!);

        connections.push(instance);

    })

    BP.allNodes = nodes;
    BP.allConnections = connections;

    return BP;

}
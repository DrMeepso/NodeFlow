# NodeFlow

NodeFlow is a TypeScript project that provides a visual editor for creating and editing blueprints. It uses the Blueprint library to represent and manipulate nodes and connections.

## Installation

To install the project, you'll need to have Node.js and npm (or any other package manager) installed. Then, run the following command in your terminal:

```
npm install
```

## Usage

To start the development server, run the following command:

```
npm start
```

This will start a local development server using vite, where you can view and interact with the blueprint editor.

## Use without GUI

All code in the src/bp folder is independent of the GUI and can be used in any project. The following code snippet shows how to create a blueprint and add nodes and connections to it:

```ts
import { Blueprint } from "./bp/blueprint";
import { Node, StartNode, Types } from "./bp/node";

// Create a new blueprint
const bp = new Blueprint();

// Create a new node
export class NewNode extends Node {
  name: string = "NewNode";
  _width: number = 100; // Change to your liking
  constructor() {
    super();

    // All inputs must be defined in the constructor
    this.addInput("number", Types.Number);

    // All outputs must be defined in the constructor
    this.addOutput("number", Types.Number);
  }
  run(runtime: Runtime): void {
    let inputs = this.getInputs(runtime); // get all connected inputs and there values

    // Do something with the inputs
    let output = inputs[0] + 1;

    // Set the output value
    this.setOutput("number", output);
  }
}

let node = new NewNode();

// Add the node to the blueprint
bp.addNode(node);
```

## Contributing

If you'd like to contribute to the project, please fork the repository and submit a pull request with your changes. Be sure to follow the existing code style and include tests for any new functionality.

## Checklist

- [x] Install Node.js and npm
- [x] Clone the repository
- [x] Run `npm install`
- [x] Run `npm start`
- [ ] Add new functionality
- [ ] Write tests for new functionality
- [ ] Submit a pull request
- [ ] Get code review
- [ ] Merge changes into main branch

## License

This project is licensed under the MIT License. See the LICENSE file for details.

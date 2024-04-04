# Nodeflow
A Node and Blueprint based programming interface made using Typescript.

## Goal
The goal of Nodeflow is to create a visual programming interface that can be used to create applications. The interface is based on nodes and blueprints. Nodes are the building blocks of the application, and blueprints are the connections between the nodes. The interface is designed to be easy to use and understand, and to allow for the creation of complex applications. And the core library is designed to be flexible and extensible, so that it can be used in a wide variety of applications.

## Use
The core Nodeflow library is located in the `core` directory. This contains the core classes and interfaces for creating a Nodeflow application, These can be used in a web application or a Node.js application. It contains no dependencies and can be used in any environment that supports Typescript / Javascript.

The `web` directory contains a web application that uses the core library to create a Nodeflow interface. This can be used as a reference for creating your own Nodeflow application. it uses Vite and Svelte to render the interface.

## Development
To start the web application / editor, run the following commands:
```bash
npm install # or "yarn install"
cd editor
npm run dev
```
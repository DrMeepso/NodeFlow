<script lang="ts">

    export let visible: boolean = false
    export let position: Vector2 = new Vector2(0, 0)

    export let CurrentBlueprint: Blueprint

    // import nodes from files
    import * as AllNodeClases from "../../../core/nodes/index"
    import { Vector2, Node, Blueprint, GenericNode } from "../../../core";

    import Icon from '@iconify/svelte';

    let allCatagories: Catagory[] = []
    Object.values(AllNodeClases).forEach( (category: any) => {

        let thisCatigory: Catagory

        if (category.default) {
            thisCatigory = category.default
        } else {
            thisCatigory = category
        }

        allCatagories.push(thisCatigory)

    })

    interface NodeEntry {

        name: string
        node: typeof GenericNode

    }

    interface Catagory {

        name: string
        category: string
        description: string
        id: string
        colour: string

        nodes: NodeEntry[]

    }

    let SelectedCatagory: Catagory = allCatagories[0]
    let IsSelectedingCatagory: boolean = true

    let CxtMenuPos: Vector2 = new Vector2(0, 0)

    function Context(e: MouseEvent){

        e.preventDefault()

        visible = true

        IsSelectedingCatagory = true
        position.x = e.clientX
        position.y = e.clientY

        CxtMenuPos = new Vector2(e.clientX, e.clientY)
        
        let mainHolder = document.getElementById("MainHolder")
        mainHolder!.style.left = position.x + "px"
        mainHolder!.style.top = position.y + "px"

    }

    function onClick(e: MouseEvent){

        visible = false

    }


    let canvas = document.getElementById("canvas")
    canvas!.oncontextmenu = Context
    canvas!.onclick = onClick

    function CatagorySelected(thisCatagory: Catagory): () => void {

        return () => {

            SelectedCatagory = thisCatagory
            IsSelectedingCatagory = false

        }

    }

    function Back(){
            
        IsSelectedingCatagory = true
    
    }

    function SpawnNode(thisNode: typeof GenericNode): () => void {

        return () => {

            let canvas = document.getElementById("canvas") as HTMLCanvasElement

            let pos = new Vector2(CxtMenuPos.x + CurrentBlueprint.Camera.Position.x, CxtMenuPos.y + CurrentBlueprint.Camera.Position.y)

            let newNode = new thisNode()
            newNode._position = pos
            CurrentBlueprint.addNode(newNode)

            visible = false

        }

    }

    let SearchValue: string = ""
    let isSeraching: boolean = false

    let RenderedNodes: NodeEntry[] = []

    $: {

        if (SearchValue == ""){

            isSeraching = false

        } else {

            isSeraching = true

            if (IsSelectedingCatagory) {

                RenderedNodes = []

                allCatagories.forEach( (thisCatagory: Catagory) => {

                    RenderedNodes = RenderedNodes.concat(thisCatagory.nodes.filter( (thisNode: NodeEntry) => {

                        return thisNode.name.toLowerCase().includes(SearchValue.toLowerCase())

                    }))

                })

            } else {

                RenderedNodes = SelectedCatagory.nodes.filter( (thisNode: NodeEntry) => {

                    return thisNode.name.toLowerCase().includes(SearchValue.toLowerCase())

                })

            }

        }

    }

</script>

<div id="MainHolder" style="display: {visible ? "block" : "none"};">

    <input type="text" placeholder="Search" bind:value={SearchValue} />

    <div id="Resalts">
        {#if IsSelectedingCatagory && !isSeraching }

            {#each allCatagories as ThisCatagory}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="CatHolder" on:click={CatagorySelected(ThisCatagory)}>
                    <p>{ThisCatagory.name}</p>
                </div>
                <hr>
            {/each}

        {:else if !isSeraching}
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="CatHolder" style="display: flex; justify-content: center;" on:click={Back}>
                <Icon icon="basil:forward-solid" color="white" hFlip={true} width=18 height=18 />
                <p>Back</p>
            </div>
            <hr>
            {#each SelectedCatagory.nodes as ThisNode}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="CatHolder" on:click={SpawnNode(ThisNode.node)}>
                    <p>{ThisNode.name}</p>
                </div>
                <hr>
            {/each}

        {:else if isSeraching}

            {#each RenderedNodes as ThisNode}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="CatHolder" on:click={SpawnNode(ThisNode.node)}>
                    <p>{ThisNode.name}</p>
                </div>
                <hr>
            {/each}

        {/if}
    </div>

</div>


<style>

    div {
        font-family: Arial, Helvetica, sans-serif;
    }

    ::-webkit-scrollbar-track {
	    border-radius: 15px;
	    background-color: rgba(71, 71, 71, 0);
    }

    ::-webkit-scrollbar {
	    width: 12px;
	    background-color: #47474700;
        border-radius: 15px;
    }

    ::-webkit-scrollbar-thumb {
	    border-radius: 15px;
	    background-color: #555;
    }

    #MainHolder {

        position: absolute;
        width: 150px;
        height: 300px;
        background-color: #1A1A1A;
        border-radius: 5px;
        z-index: 1000;

        overflow: hidden;

    }

    input {

        height: 20px;
        width: calc(100% - 10px);

        background-color: #212121;
        border: 0;
        outline: none;

        color: white;
        font-family: Arial, Helvetica, sans-serif;

        border-bottom: 1px solid #585858;

        padding: 5px;

        font-size: 18px;
        text-align: center;

    }

    input::placeholder {

        color: white;
        font-family: Arial, Helvetica, sans-serif;

        text-align: center;

    }

    #Resalts {

        position: absolute;
        width: 100%;
        height: calc(100% - 40px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .CatHolder{

        width: 100%;
        padding: 3px;

        cursor: pointer;

    }

    p {
            
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 0;

        text-align: center;

    }

    hr {

        width: 150px;
        height: 1px;
        background-color: #585858;
        border: 0;
        margin: 0;
        padding: 0;

    }

</style>
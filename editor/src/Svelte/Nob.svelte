<script lang="ts">

    export let heightVariable;

    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();

    let currentY = 0
    let IsDragging = false

    function mouseDown(){
        IsDragging = true
    }

    function mouseUp(){
        IsDragging = false
    }

    function mouseMove(e: any){

        currentY = e.clientY

        if (IsDragging){

            heightVariable = window.innerHeight - currentY

            dispatch("heightChange", heightVariable)

        }

    }

</script>

<svelte:document on:mousemove={mouseMove} on:mouseup={mouseUp} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="Draggable" on:mousedown={mouseDown} on:mouseup={mouseUp}></div>

<style>

    #Draggable{

        width: 100%;
        height: 3px;
        background-color: #212121;
        cursor: ns-resize;

    }

</style>
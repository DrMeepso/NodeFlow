<script lang="ts">

    import { writable } from 'svelte/store'
    import Icon from '@iconify/svelte';

    import { LogLevels, Log, Blueprint, Node, Vector2 } from "../../../core"
    import Nob from "./Nob.svelte";

    export let height: number = 200;
    export let CurrentBlueprint: Blueprint
    export let logs: Log[] = []

    let innerHeight = window.innerHeight

    $: {

        let space = document.getElementById("canvasSpace")
        space!.style.height = (innerHeight - height) + "px"

    }

    $: {

        let x = logs

        // on logs change scroll to bottom
        let logHolder = document.getElementById("LogHolder")
        if (logHolder != null){
            logHolder.scrollTop = logHolder.scrollHeight
        }

    }

    function getColor(loglevel: LogLevels): string{

        switch (loglevel){

            case LogLevels.Info:
                return "#3abff8"

            case LogLevels.Warning:
                return "#fbbd23"

            case LogLevels.Error:
                return "#f87272"
        }

    }

    function getIcon(loglevel: LogLevels): string{

        switch (loglevel){

            case LogLevels.Info:
                return "basil:info-circle-solid"

            case LogLevels.Warning:
                return "basil:info-triangle-solid"

            case LogLevels.Error:
                return "basil:cancel-solid"
        }

    }

    function clearLogs(){

        CurrentBlueprint.runtime.RecordedLogs = []
        logs = []

    }

    function getNoLogsText(): string{

        let rand = Math.floor(Math.random() * 3)
        if (rand == 0){
            return "Nothing to see here..."
        }else if (rand == 1){
            return "No logs yet!"
        }else{
            return "Waiting for logs..."
        }


    }

    import { tweened } from 'svelte/motion';
    import { cubicOut, backOut, expoOut } from 'svelte/easing';

    function lookAtNode(thisNode: Node): undefined{
        
        let canvas = document.getElementById("canvas") as HTMLCanvasElement
        let wantedPos = new Vector2(thisNode._position.x - (canvas.width / 2) + (thisNode._width / 2), thisNode._position.y - canvas.height / 2)

        function lerp(start: number, end: number, amt: number) {
            return (1 - amt) * start + amt * end
        }

        let start = CurrentBlueprint.Camera.Position
        let end = wantedPos
        
        // start cubidout tween from 0 to 1 
        let { subscribe, set } = tweened(0, {
            duration: 500,
            easing: expoOut
        });

        // subscribe to tweened value
        let unsubscribe = subscribe(value => {

            // set camera position to lerp between start and end
            CurrentBlueprint.Camera.Position = new Vector2(lerp(start.x, end.x, value), lerp(start.y, end.y, value))

        });

        // set tweened value to 1
        set(1);



        return undefined

    }

</script>

<svelte:window bind:innerHeight={innerHeight} />

<Nob bind:heightVariable={height} /> <!--Draggable black line to resize-->
<main id="Logs" style="height: {height}px">

    <div id="LogHeader">
        <p>Logs</p>
        <p on:click={clearLogs}>({logs.length}) Clear</p>
    </div>

    {#if logs.length === 0}
        <p id="noLogs" style="color: white; margin-left: 5px;">{getNoLogsText()}</p>
    {/if}

    <div id="LogHolder">
        {#each logs as thisLog}
            <div id="Log">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div id="Clickable" on:click={lookAtNode(thisLog.LoggedNode)}>
                    <Icon icon="{getIcon(thisLog.LoggedLevel)}" style="color: {getColor(thisLog.LoggedLevel)}; margin-left: 3px;" width="30" height="30"/>
                </div>
                <p style="color: {getColor(thisLog.LoggedLevel)}">{thisLog.LogValue}</p>
            </div>
        {/each}
    </div>

</main>

<style>
    
    #LogHeader {

        background-color: #212121;

        height: 30px;

        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;

    }

    #LogHolder {

        display: flex;
        flex-direction: column;
        justify-content: flex;

        overflow-y: scroll;

        gap: 2px;

        height: calc(100% - 40px);

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

    #Log{
        display: flex;
        align-items: center;

        border-bottom: 1px solid #212121;
        
    }

    #Clickable {

        width: 30px;
        height: 30px;

        cursor: pointer;

    }

    #noLogs {

        width: 100%;
        text-align: center;
        opacity: 0.3;

    }

    main {

        background-color: #1A1A1A;

    }

    p{

        font-family: Arial, Helvetica, sans-serif;
        color: white;

        margin: 0;

        margin-left: 5px;
        margin-right: 5px;

        text-align: left;


    }

</style>
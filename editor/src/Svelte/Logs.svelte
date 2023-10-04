<script lang="ts">

    import { writable } from 'svelte/store'

    import { LogLevels, Log, Blueprint } from "../../../core"
    import Nob from "./Nob.svelte";

    export let height: number = 200;
    export let CurrentBlueprint: Blueprint
    export let logs: Log[] = []

    let innerHeight = window.innerHeight

    $: {

        let space = document.getElementById("canvasSpace")
        space!.style.height = (innerHeight - height) + "px"

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

    function clearLogs(){

        CurrentBlueprint.runtime.RecordedLogs = []
        logs = []

    }

</script>

<svelte:window bind:innerHeight={innerHeight} />

<Nob bind:heightVariable={height} /> <!--Draggable black line to resize-->
<main id="Logs" style="height: {height}px">

    <div id="LogHeader">
        <p>Logs</p>
        <p on:click={clearLogs}>({logs.length}) Clear</p>
    </div>

    <div id="LogHolder">
        {#each logs as thisLog}
            <p style="color: {getColor(thisLog.LoggedLevel)}">{thisLog.LogValue}</p>
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

    main {

        background-color: #1A1A1A;

    }

    p{

        font-family: Arial, Helvetica, sans-serif;
        color: white;

        margin: 0;

        margin-left: 15px;
        margin-right: 15px;

        border-bottom: 1px solid #212121;

    }

</style>
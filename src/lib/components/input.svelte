<script lang="ts">
    import { ChevronUp, ChevronDown } from "lucide-svelte";

    let { value, onchange = () => {}, min = 0, max = undefined } = $props();
</script>

<div class="input">
    <div class="value">
        <span>{value}</span>
    </div>
    <div class="control">
        <button
            onclick={() => {
                if (max === undefined || value < max) {
                    onchange(++value);
                }
            }}
        >
            <ChevronUp size={16} strokeWidth={4} />
        </button>
        <button
            onclick={() => {
                if (min === undefined || value > min) {
                    onchange(--value);
                }
            }}><ChevronDown size={16} strokeWidth={4} /></button
        >
    </div>
</div>

<style lang="scss">
    .input {
        display: flex;
    }

    .value {
        width: 4em;
        height: 2.8em;
        border: 1px #c6c6c6 solid;
        border-top-left-radius: 0.8em;
        border-bottom-left-radius: 0.8em;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .control {
        height: 2.8em;
        display: flex;
        flex-direction: column;

        button {
            height: 50%;
            width: 2em;
            color: #a6a6a6;
            border: none;
            background: transparent;
            border: 1px #c6c6c6 solid;
            cursor: pointer;
            padding-top: 0.2em;
        }

        button:nth-child(1) {
            border-left: none;
            border-bottom: none;
            border-top-right-radius: 0.8em;
        }

        button:nth-child(2) {
            border-left: none;
            border-bottom-right-radius: 0.8em;
        }
    }
</style>

<script lang="ts">
    let { active = false, activeClass = "", onclick = () => {} } = $props();
    const toggleSwitch = function () {
        active = !active;
        onclick();
    };
</script>

<div class="switch">
    <button
        onclick={toggleSwitch}
        aria-label="switch"
        class={active ? `active ${activeClass}` : ""}
    >
        <span></span>
    </button>
</div>

<style lang="scss">
    .switch button {
        display: block;
        height: 2em;
        width: 3.5em;
        position: relative;
        background: #c6c6c6;
        border-radius: 1em;
        cursor: pointer;
        border: none;
        transition: 0.3s;

        &.active span {
            left: 1.75em;
        }

        span {
            height: 1.5em;
            width: 1.5em;
            top: 0.25em;
            left: 0.3em;
            position: absolute;
            border-radius: 100%;
            background: white;
            transition: 0.3s;
        }
    }
</style>

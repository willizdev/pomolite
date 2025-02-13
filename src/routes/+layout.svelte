<script lang="ts">
    import "../app.scss";
    let { children } = $props();
</script>

<svelte:head>
    <title>Pomolite</title>
</svelte:head>

{@render children?.()}

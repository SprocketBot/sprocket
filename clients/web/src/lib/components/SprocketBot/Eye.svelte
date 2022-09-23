<script lang="ts">
    export let side: "left" | "right";

    let clazz: string = "";
    export { clazz as class };

    const _class = `${clazz} ${side}`

    let rotate: number = 0;
    let transform: string;
    $: transform = `transform: translate(${side === "left" ? "-50%" : "50%"}, -50%) rotate(${rotate - 90}deg)`

    let elm: SVGElement | undefined;
    let elmX: number | undefined;
    let elmY: number | undefined;
    $: if (elm) {
        const elmRect = elm.getBoundingClientRect();
        elmX = elmRect.left + (elmRect.width / 2);
        elmY = elmRect.top + (elmRect.height / 2);
    }

    const onMouseMove = (e: MouseEvent) => {
        if (elmX !== undefined && elmY !== undefined) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const dx = elmX - mouseX;
            const dy = elmY - mouseY;
            const rad = Math.atan2(dy, dx);

            rotate = rad * 180 / Math.PI;
        }
    }
</script>


<svelte:window on:mousemove={onMouseMove} />

<svg bind:this={elm} class={_class} style={transform} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={50} class="fill-[#4E4D4E]" />
    <circle cx={50} cy={35} r={20} class="fill-[#FFFFFF]" />
</svg>


<style lang="postcss">
    svg {
        @apply select-none;
    }
</style>
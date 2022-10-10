<script lang="ts">
    export let items: Array<{
        label: string;
        action: CallableFunction;
    }> = [];
    let _class = "";
    export {_class as class};
</script>

<div class="dropdown {_class}">
    <slot name="handle">
        <span tabindex="0" class="btn m-1">Click</span>
    </slot>

    <ul
        tabindex="0"
        class="dropdown-content menu p-1 md:p-2 mt-2 shadow bg-base-100 rounded-box"
    >
        {#each items as item}
            <li>
                <button class="whitespace-nowrap" on:click={item.action}
                    >{item.label}</button
                >
            </li>
        {/each}
    </ul>
</div>

<script lang="ts">
    import {onMount} from "svelte";

    let listEl: HTMLDivElement;
    let showCards = false;
    let neededWidth = 0;

    onMount(() => {
        const measure = (): void => {
            if (!listEl) return;

            const table = listEl.querySelector("table");
            const tableWrap = listEl.querySelector(".scrim-list-table");
            const available = listEl.clientWidth;
            const tableVisible = table instanceof HTMLElement
                && tableWrap instanceof HTMLElement
                && getComputedStyle(tableWrap).display !== "none";

            if (tableVisible) {
                neededWidth = table.scrollWidth;
            }

            if (neededWidth <= 0 || available <= 0) return;

            if (showCards) {
                if (available >= neededWidth + 8) showCards = false;
            } else if (neededWidth > available + 1) {
                showCards = true;
            }
        };

        const resize = new ResizeObserver(measure);
        resize.observe(listEl);
        const mutations = new MutationObserver(measure);
        mutations.observe(listEl, {childList: true, subtree: true, characterData: true});
        requestAnimationFrame(measure);

        return () => {
            resize.disconnect();
            mutations.disconnect();
        };
    });
</script>

<div class="scrim-list" class:show-cards={showCards} bind:this={listEl}>
    <div class="scrim-list-cards">
        <slot name="cards"/>
    </div>
    <div class="scrim-list-table">
        <slot name="table"/>
    </div>
</div>

<style lang="postcss">
    .scrim-list {
        width: 100%;
        min-width: 0;
        overflow-x: hidden;
    }

    .scrim-list-cards {
        display: none;
        flex-direction: column;
        gap: 1rem;
    }

    .scrim-list-table {
        display: block;
        width: 100%;
        min-width: 0;
    }

    /* class:show-cards must exist on the markup. Svelte 3 drops CSS for
       attributes that are only set at runtime (e.g. data-cards from JS). */
    .scrim-list.show-cards .scrim-list-cards {
        display: flex;
    }

    .scrim-list.show-cards .scrim-list-table {
        display: none;
    }
</style>

<style lang="postcss">
    main {
        @apply h-screen max-h-screen w-screen
               grid grid-cols-6 grid-rows-6 text-gray-100 bg-sproc_light_gray-800;
    }
    main > * {
        @apply h-full max-h-full min-h-full 
               w-full max-w-full min-w-full;
    }
    aside {
        @apply flex flex-col;
    }
    aside > section {
        @apply flex-1 overflow-y-auto;
    }
    .preview {
        @apply bg-sproc_dark_gray-300 col-start-1 
                col-span-4 row-start-1 row-span-4;
        background-size: cover;
        background-repeat: no-repeat;
        background-opacity: 0.5;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448.208 297.643'%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Pattern_Page' data-name='Pattern Page'%3E%3Cg id='Pattern_Large_Dark' data-name='Pattern Large Dark'%3E%3Crect width='448.208' height='297.593' fill='%230d0e0e'/%3E%3Cpath d='M344.5273,240.0829c1.37-2.3469,3.6123-2.1359,5.8272-2.1359q37.0473-.03,74.1084-.0291H448.208V200.971q-58.1558.1479-116.3115-.072c-5.3262-.027-8.4375,1.687-11.0225,6.249-12.9472,22.9149-26.1582,45.6449-39.2627,68.427-.87,1.53-2.48,3.006-1.8994,4.773,1.9522,6.065,5.5371,11.391,9.1768,16.533a5.2813,5.2813,0,0,0,.6631.762H448.208V262.397A13.3524,13.3524,0,0,0,443.2,261.6c-33.8057.211-67.61.105-101.415.105-1.7676,0-3.5079.027-5.2745-.0791-2.6367-.1849-3.5586-1.4769-2.1621-3.9029C337.7236,251.8171,341.1523,245.9631,344.5273,240.0829Z' fill='%234e4d4e'/%3E%3Cpath d='M254.7148,286.7292c-3.0332-4.7991-2.5566-8.4911.1846-13.2112,17.2715-29.48,34.4375-59.0659,51.208-88.8629,3.2432-5.7479,6.8291-7.7,13.3955-7.647,28.377.1713,80.7061.1955,128.7051.181V139.9909c-50.4551-.0112-113.417-.0071-143.5771.0481-10.2569.0261-17.7989,4.5352-23.02,13.6851Q249.5332,209.97,216.9277,265.95c-5.6162,9.652-5.7216,18.881-.0263,28.531.622,1.05,1.2324,2.1088,1.8506,3.1619h42.5908C259.1787,293.9753,256.9717,290.3242,254.7148,286.7292Z' fill='%234e4d4e'/%3E%3Cpath d='M21.9453.051q.0088,26.71.0205,53.4244V206.28L58.84,184.6713v-74.45a17.6122,17.6122,0,0,0,.1719-2.49Q58.78,53.8918,58.88.051Z' fill='%234e4d4e'/%3E%3Cpath d='M82.7432,161.4453c0,7.9641.3955,8.1479,7.4365,4.113,5.3271-3.058,10.6269-6.1431,16.0058-9.0969,9.15-4.9832,13.66-12.7091,13.6856-23.0462.0176-28.1551.0342-84.8972.0234-133.3642H82.7217C82.6494,54.8891,82.7246,126.43,82.7432,161.4453Z' fill='%234e4d4e'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .controls {
        @apply bg-sproc_light_gray-800 border-t-2 border-sproc_dark_gray-800
                col-span-4 col-start-1 row-start-5 row-span-2 overflow-auto;
    }
    .side-panel {
        @apply bg-sproc_light_gray-800 border-l-2 border-sproc_dark_gray-800
                col-span-2 col-start-5 row-start-1 row-span-6 overflow-auto;
    }
</style>

<script lang="ts">
    import PageHeader from "$components/molecules/PageHeader.svelte";
</script>

<main>
    <!-- Main View -->
    <section class="preview">
        <slot name="preview" />
    </section>

    <!-- Bottom Panel -->
    <section class="controls">
        <slot name="controls" />
    </section>
    <!-- Right Panel -->
    <aside class="side-panel">
        <PageHeader />
        <section>
            <slot name="sidePanel" />
        </section>
    </aside>
</main>

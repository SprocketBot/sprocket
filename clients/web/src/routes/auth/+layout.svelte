<script lang="ts">
    import LogoSquarePrimary from "$lib/images/logo-square-primary.png";
    import {CenterCard} from "$lib/components"
</script>
<CenterCard>
    <header class="flex gap-4 items-center">
        <img src={LogoSquarePrimary} alt="Sprocket Logo" class="w-16"/>
        <h1 class="text-center text-3xl font-bold tracking-wide">Sprocket Login</h1>
    </header>
    <hr class="my-2 border-gray-500"/>

    <slot/>
</CenterCard>
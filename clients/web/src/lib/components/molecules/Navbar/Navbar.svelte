<script lang="ts">
    import LogoFullDark from "$lib/images/logo-full-dark.png";
    import LogoSquarePrimary from "$lib/images/logo-square-primary.png"
    import {XSmallScreenQuery} from "$lib/stores/MediaQuery"

    let _class: string;
    export {_class as class}

</script>

<nav class="border-gray-700 py-2.5 bg-gray-800 border-b {_class} h-11">
    <div class="px-5 grid grid-cols-3 grid-rows-1 items-center justify-between mx-auto gap-8 h-full">
        <a href="/" class="flex items-center">
            <img src={$XSmallScreenQuery ? LogoSquarePrimary: LogoFullDark} class="h-6 w-auto" alt="Sprocket Logo" />
        </a>
        <div>
            <slot name="contentCenter"/>
        </div>

        <div class="flex-1 flex justify-between items-center" id="navbar-default">
            <div>
                <slot name="contentRight" />
            </div>
        </div>
    </div>
</nav>

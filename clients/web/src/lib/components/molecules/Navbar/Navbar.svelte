<script lang="ts">
    import LogoFullDark from "$lib/images/logo-full-dark.png";

    let _class: string;
    export {_class as class}

</script>

<nav class="border-gray-700 py-2.5 bg-gray-800 border-b {_class}">
    <div class="px-5 flex flex-wrap items-center justify-between mx-auto gap-8">
        <a href="/" class="flex items-center">
            <img src={LogoFullDark} class="h-6" alt="Sprocket Logo" />
        </a>

        <div class="flex-1 flex justify-between items-center" id="navbar-default">
            <div>
                <slot name="contentRight" />
            </div>
        </div>
    </div>
</nav>

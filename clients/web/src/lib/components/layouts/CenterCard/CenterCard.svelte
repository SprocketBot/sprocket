<script lang="ts">
    import bg from "$lib/images/bg-pattern.svg";
</script>

<main
    class="w-full h-screen flex justify-center items-center bg-gray-900 p-8 text-gray-100 bg-[url('{bg}')] bg-cover bg-opacity-10"
    style="background-image: url('{bg}')"
>
    <div class="w-full md:w-96 bg-gray-700 p-8 rounded-md border-gray-800 border">
        <slot />
    </div>
</main>

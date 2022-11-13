<script lang="ts">
    export let header = "This is a Sprocket Card 2.0";
    export let text = "Here we'll have text to make it look like we know what we're talking about. ";
    export let buttonLink: string;
    export let buttonText: string = "Read more";
</script>

<a
    href="nolink"
    class="block p-6 max-w-sms 
    bg-primary-800 
    rounded-lg border 
    border-primary-400 
    shadow-md 
    hover:bg-primary-400"
>
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-primary-50">
        {header}
    </h5>
    <p class="font-normal text-primary-100">
        {text}
    </p>
    {#if buttonLink}
        <a
            href={buttonLink}
            class="inline-flex items-center py-2 px-3 text-sm
    font-medium text-center text-white bg-secondary-700 rounded-lg hover:bg-secondary-800
    focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
            {buttonText}
            <svg
                aria-hidden="true"
                class="ml-2 -mr-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    fill-rule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                /></svg
            >
        </a>
    {/if}
</a>

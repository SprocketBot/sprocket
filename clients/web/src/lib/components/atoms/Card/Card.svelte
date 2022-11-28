<script lang="ts">
    export let buttonLink: string;
    export let buttonText = "Read more";
</script>

<div
    class="block p-6 max-w-sms
    bg-gray-800
    rounded-lg border
    border-gray-400
    shadow-md
    text-gray-100"
>
    <slot>
        <p class="font-normal text-gray-100">
            "Here we'll have text to make it look like we know what we're talking about."
        </p>
    </slot>
</div>

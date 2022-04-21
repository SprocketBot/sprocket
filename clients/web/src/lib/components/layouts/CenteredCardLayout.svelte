<main>
    <slot/>
</main>

<style lang="postcss">
    main {
        @apply w-screen h-screen flex justify-center items-center bg-cover bg-center relative;
        background:linear-gradient(147deg,
            transparent 50%,
            theme("colors.sprocket") 300%
        );

    }
</style>
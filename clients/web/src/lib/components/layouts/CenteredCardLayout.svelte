<main>
    <slot/>
</main>

<style lang="postcss">
    main {
        @apply w-full h-screen max-w-full overflow-x-hidden flex justify-center items-center bg-cover bg-center relative;
        /*background:linear-gradient(147deg,*/
        /*    transparent 50%,*/
        /*    theme("colors.sprocket") 300%*/
        /*);*/
        background-size: cover;
        background-position: center;
        background-image: url("/img/login-bg.svg");

    }
</style>
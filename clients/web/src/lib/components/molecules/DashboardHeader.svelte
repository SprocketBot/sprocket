<script>
    import {Avatar} from "$lib/components";
    import {user} from "$lib/stores/user";
</script>

<img src="/img/logo.svg" alt="Sprocket"/>

<hr/>
<section>
    <!-- TODO: User Data -->
    <Avatar class="w-1/3"/>
    <div>
        <h2>{$user.username}</h2>
        <span>Foundation</span>
        <span>Free Agency</span>
    </div>
</section>

<style lang="postcss">

    img {
        @apply mb-4;
    }
    hr {
        @apply w-1/3 mx-auto my-2 border-t-sprocket;
    }

    section {
        @apply p-4 flex gap-4 items-center justify-center;

        div {
            @apply text-center flex flex-col justify-center items-center;
            h2 {
                @apply font-semibold leading-none mb-2;
            }
            span {
                @apply text-sm font-light leading-none;
            }
        }
    }
</style>
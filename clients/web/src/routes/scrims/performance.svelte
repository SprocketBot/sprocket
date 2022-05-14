<script lang="ts">
    import {
        BigNumber,
        DashboardLayout,
        Card,
    } from "$lib/components";
</script>

<DashboardLayout>
    <div class="row">
        <Card>
            <img src="https://via.placeholder.com/500x200/4e4d4e/f5c04e.png" />
            <span>Scrim Activity</span>
        </Card>
        <Card>
            <BigNumber num={5} label="Pending Scrims" />
        </Card>
        <Card>
            <BigNumber num={20} label="Active Players" />
        </Card>
    </div>
</DashboardLayout>

<style lang="postcss">
    .row {
        @apply flex gap-4 w-full mb-8;

        &:global(> *) {
            @apply flex-1;
        }

        img {
            @apply w-full mb-2;
        }

        span {
            @apply text-xl;
        }
    }

    h2 {
        @apply text-4xl mb-8;
    }
</style>

<script lang="ts">
    import {DashboardCard} from "../molecules";

    export let description: string;
    export let title: string;
    export let value: number;
</script>

<DashboardCard
    {title}
    class="col-span-6 sm:col-span-2 xl:col-span-1"
    quietTitle
>
    <div class="h-full w-full flex justify-center items-center flex-col">
        <p class="flex-1" />
        <span class="text-7xl text-sprocket font-bold text-center block flex-1"
            >{value}</span
        >
        <p class="flex-1">{description ?? ""}</p>
    </div>
</DashboardCard>

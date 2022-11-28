<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Dropdown from "./Dropdown.svelte";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/Dropdown" layout={{type: "single"}}>
    <svelte:fragment slot="controls" />

    <Hst.Variant title="Default">
        <div class="h-screen w-screen flex justify-center items-start p-8">
            <Dropdown>
                <i slot="handle">Handle Text</i>
                <ul class="py-1 text-sm text-gray-200" aria-labelledby="dropdownDefault">
                    <li>
                        <a href="#" class="block py-2 px-4 hover:bg-gray-600 hover:text-white">Dashboard</a>
                    </li>
                    <li>
                        <a href="#" class="block py-2 px-4 hover:bg-gray-600 hover:text-white">Settings</a>
                    </li>
                    <li>
                        <a href="#" class="block py-2 px-4 hover:bg-gray-600 hover:text-white">Earnings</a>
                    </li>
                    <li>
                        <a href="#" class="block py-2 px-4 hover:bg-gray-600 hover:text-white">Sign out</a>
                    </li>
                </ul>
            </Dropdown>
        </div>
    </Hst.Variant>
</Hst.Story>

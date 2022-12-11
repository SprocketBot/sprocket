<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Banknotes} from "@steeze-ui/heroicons";

    import Sidebar from "./Sidebar.svelte";
    import SidebarItem from "./atoms/SidebarItem.svelte";
    import SidebarDivider from "./atoms/SidebarDivider.svelte";
    import SidebarGroup from "./SidebarGroup.svelte";

    import Badge from "$lib/components/atoms/Badge/Badge.svelte";
    import Alert from "$lib/components/atoms/Alert/Alert.svelte";

    export let Hst: _Hst;

    let withHeader = true;
    let fullHeight = true;
</script>

<Hst.Story title="Molecules/Sidebar">
    <svelte:fragment slot="controls">
        <div class="flex flex-col gap-2 px-8">
            <label>
                <span>Show Header</span>
                <input type="checkbox" bind:checked={withHeader} />
            </label>
            <label>
                <span>Full Height</span>
                <input type="checkbox" bind:checked={fullHeight} />
            </label>
        </div>
    </svelte:fragment>
    <Hst.Variant title="Default">
        <div class="h-screen">
            <Sidebar {withHeader} {fullHeight}>
                <SidebarItem icon={Banknotes} label="Sidebar Item" />
                <SidebarDivider />
                <SidebarItem icon={Banknotes} label="With Badge">
                    <Badge color="info">Pro</Badge>
                </SidebarItem>
                <SidebarItem label="With no icon" />
                <SidebarDivider />
                <SidebarGroup label="Sidebar Group" icon={Banknotes}>
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                </SidebarGroup>

                <Alert variant="info" slot="footer">Alert!</Alert>
            </Sidebar>
        </div>
    </Hst.Variant>
    <Hst.Variant title="Small Width">
        <div class="h-screen">
            <Sidebar {withHeader} {fullHeight} width="sm">
                <SidebarItem icon={Banknotes} label="Sidebar Item" />
                <SidebarDivider />
                <SidebarItem icon={Banknotes} label="With Badge">
                    <Badge color="info">Pro</Badge>
                </SidebarItem>
                <SidebarItem label="With no icon" />
                <SidebarDivider />
                <SidebarGroup label="Sidebar Group" icon={Banknotes}>
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                </SidebarGroup>
            </Sidebar>
        </div>
    </Hst.Variant>
    <Hst.Variant title="Full Width">
        <div class="h-screen p-8">
            <Sidebar {withHeader} {fullHeight} width="full">
                <SidebarItem icon={Banknotes} label="Sidebar Item" />
                <SidebarDivider />
                <SidebarItem icon={Banknotes} label="With Badge">
                    <Badge color="info">Pro</Badge>
                </SidebarItem>
                <SidebarItem label="With no icon" />
                <SidebarDivider />
                <SidebarGroup label="Sidebar Group" icon={Banknotes}>
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                    <SidebarItem label="Group Child 1" />
                </SidebarGroup>

                <Alert variant="info" slot="footer">Alert!</Alert>
            </Sidebar>
        </div>
    </Hst.Variant>
</Hst.Story>

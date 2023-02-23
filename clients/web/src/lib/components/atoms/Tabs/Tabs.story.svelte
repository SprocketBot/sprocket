<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {AcademicCap} from "@steeze-ui/heroicons";
    import Tabs from "./Tabs.svelte";
    import TabTest from "./Tab.test.svelte";
    import type {TabItems} from "./types";
    export let Hst: _Hst;

    const tabs: TabItems = {
        "Tab One": {component: TabTest, props: {content: "Test Tab One"}},
        "Tab Two": {component: TabTest, props: {content: "Test Tab Two"}},
        "Tab Three": {component: TabTest, props: {missingProp: false}},
        "Tab With Icon": {component: TabTest, props: {content: "I have a tab!"}, icon: AcademicCap},
    };
</script>

<Hst.Story title="Atoms/Tabs" layout={{type: "grid", width: 800}}>
    <Hst.Variant title="Default">
        <Tabs {tabs} activeKey="Tab One" />
    </Hst.Variant>
</Hst.Story>

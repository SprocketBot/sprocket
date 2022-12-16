<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {setContext} from "svelte";
    import Breadcrumb from "./Breadcrumb.svelte";
    import {type BreadcrumbContext, BREADCRUMB_CONTEXT_KEY} from "./types";
    import {Home} from "@steeze-ui/heroicons";
    import StoryHelper from "./__StoryHelper.svelte";
    export let Hst: _Hst;

    setContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY, []);
</script>

<Hst.Story title="Atoms/Breadcrumb" layout={{type: "grid", width: "auto"}}>
    <Hst.Variant title="Default">
        <StoryHelper crumb={{target: "#top", label: "Top", icon: Home}}>
            <StoryHelper crumb={{target: "#second", label: "Second"}}>
                <StoryHelper crumb={{target: "#current", label: "Current"}}>
                    <Breadcrumb />
                </StoryHelper>
            </StoryHelper>
        </StoryHelper>
    </Hst.Variant>
    <Hst.Variant title="Without Context">
        <Breadcrumb />
    </Hst.Variant>
</Hst.Story>

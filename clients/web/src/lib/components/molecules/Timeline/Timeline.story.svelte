<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {ChevronDown, ChevronUp, HandThumbDown, PencilSquare, Trophy} from "@steeze-ui/heroicons";
    import {subMinutes, subDays} from "date-fns";
    import {faker} from "@faker-js/faker";

    import Timeline from "./Timeline.svelte";
    import TimelineItem from "./TimelineItem.svelte";

    export let Hst: _Hst;

    const now = new Date();
</script>

<Hst.Story title="Molecules/Timeline" layout={{type: "grid", width: 500}}>
    <Hst.Variant title="Default">
        <Timeline>
            <TimelineItem title="Timeline Item 1" />
            <TimelineItem title="Timeline Item 2" />
            <TimelineItem title="Timeline Item 3" />
            <TimelineItem title="Timeline Item 4" />
            <TimelineItem title="Timeline Item 5" />
            <TimelineItem title="Timeline Item 6" />
        </Timeline>
    </Hst.Variant>

    <Hst.Variant title="With Dates">
        <Timeline>
            <TimelineItem title="Won MLE Championship" date={subMinutes(now, 3)} />
            <TimelineItem title="Won against Puffins" date={subMinutes(now, 3)} />
            <TimelineItem title="Salary increased to 14.5" date={subDays(now, 4)} />
            <TimelineItem title="Salary decreased to 14.0" date={subDays(now, 25)} />
            <TimelineItem title="Signed to Dodgers" date={subDays(now, 45)} />
        </Timeline>
    </Hst.Variant>

    <Hst.Variant title="With Icons">
        <Timeline>
            <TimelineItem title="Won MLE Championship" date={subMinutes(now, 3)} icon={Trophy} />
            <TimelineItem title="Salary increased to 14.5" date={subDays(now, 4)} icon={ChevronUp} />
            <TimelineItem title="Lost against Puffins" date={subDays(now, 9)} icon={HandThumbDown} />
            <TimelineItem title="Salary decreased to 14.0" date={subDays(now, 25)} icon={ChevronDown} />
            <TimelineItem title="Signed to Dodgers" date={subDays(now, 45)} icon={PencilSquare} />
        </Timeline>
    </Hst.Variant>

    <Hst.Variant title="With Slot Content">
        <Timeline>
            <TimelineItem title="Timeline Item 1">
                {faker.lorem.paragraph()}
            </TimelineItem>

            <TimelineItem title="Timeline Item 2">
                {faker.lorem.paragraph()}
            </TimelineItem>

            <TimelineItem title="Timeline Item 3">
                {faker.lorem.paragraph()}
            </TimelineItem>
        </Timeline>
    </Hst.Variant>

    <Hst.Variant title="With Links">
        <Timeline>
            <TimelineItem title="Google" href="https://google.com" />
            <TimelineItem title="GitHub" href="https://github.com" />
            <TimelineItem title="Click Me" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </Timeline>
    </Hst.Variant>
</Hst.Story>

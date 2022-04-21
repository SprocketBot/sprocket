<div class="stat place-items-center px-0 lg:py-8">
    {#if $$slots.figure}
        <div class="stat-figure">
            <slot name="figure"/>
        </div>
    {/if}
    <div class="stat-title">
        <slot name="title"/>
    </div>
    <div class="stat-value">
        <slot name="value"/>
    </div>
    <div class="stat-desc">
        <slot name="description"/>
    </div>
</div>

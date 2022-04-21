<script lang="ts">
    export let compact: boolean | undefined;

    let _class: string;
    export {_class as class};
</script>

<div class="card {_class ?? ''}" class:card-compact={compact}>
    <figure><slot name="figure"/></figure>
    
    <div class="card-body">
        <div class="card-title"><slot name="title"/></div>
        <slot/>
    </div>
</div>


<script lang="ts">
    import Gear from "./icons/Gear.svelte";

    let _class = "";
    export {_class as class};
</script>


<div class="flex gap-2 {_class ?? ''} justify-center items-center text-primary h-full">
    <span class="h-full"><Gear/></span>
    <span class="h-full"><Gear/></span>
    <span class="h-full"><Gear/></span>
</div>


<style lang="postcss">
    @keyframes bounce {
        0%   { transform: scale(1,1)      translateY(0)      rotate(0); }
        10%  { transform: scale(1.1,.9)   translateY(0)      rotate(36deg); }
        30%  { transform: scale(.9,1.1)   translateY(-100%)  rotate(108deg); }
        50%  { transform: scale(1.05,.95) translateY(0)      rotate(180deg); }
        57%  { transform: scale(1,1)      translateY(-10%)   rotate(205deg); }
        64%  { transform: scale(1,1)      translateY(0)      rotate(230deg); }
        100% { transform: scale(1,1)      translateY(0)      rotate(360deg); }
    }
    @keyframes bounce-alt {
        0%   { transform: scale(1,1)      translateY(0)      rotate(0); }
        10%  { transform: scale(1.1,.9)   translateY(0)      rotate(-36deg); }
        30%  { transform: scale(.9,1.1)   translateY(-100%)  rotate(-108deg); }
        50%  { transform: scale(1.05,.95) translateY(0)      rotate(-180deg); }
        57%  { transform: scale(1,1)      translateY(-10%)   rotate(-205deg); }
        64%  { transform: scale(1,1)      translateY(0)      rotate(-230deg); }
        100% { transform: scale(1,1)      translateY(0)      rotate(-360deg); }
    }

    span {
        transform-origin: center;
        animation: bounce 2s linear infinite;
        animation-fill-mode: both;
    }

    span:nth-child(2) { animation-delay: 0.66s; animation-name: bounce-alt; }
    span:nth-child(3) { animation-delay: 1.32s; }
</style>

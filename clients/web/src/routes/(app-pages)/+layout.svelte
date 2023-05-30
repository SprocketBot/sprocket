<script lang="ts">
    import {AuthGuard} from "$lib/components";
    import {authIntervalRefresh, SetUserInfoContext, SetCurrentScrimContext, CurrentScrimLiveStore} from "$lib/api";
    import type {LayoutData} from "./$types";
    import {derived} from "svelte/store";
    import { onMount } from "svelte";
    import { CurrentScrimSubStore } from "$houdini";

    export let data: LayoutData;

    const {userInfo, currentScrim} = data;
    SetUserInfoContext(
        derived([userInfo], ([$ui]) => {
            return $ui.data?.me;
        }),
    );
    
    const currentScrimSub = new CurrentScrimSubStore()
    onMount(() => {
        currentScrimSub.listen()
        return () => currentScrimSub.unlisten()
    })
    SetCurrentScrimContext(
        CurrentScrimLiveStore(
            currentScrim,
            currentScrimSub
        )
    )

    authIntervalRefresh();
</script>

<AuthGuard behavior="login-with-return">
    <slot />
</AuthGuard>

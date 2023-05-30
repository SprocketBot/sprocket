<script lang="ts">
    import {AuthGuard} from "$lib/components";
    import {SetUserInfoContext} from "$lib/context/UserInfo.context";
    import type {LayoutData} from "./$types";
    import {derived} from "svelte/store";

    export let data: LayoutData;

    const {userInfo} = data;
    SetUserInfoContext(
        derived([userInfo], ([$ui]) => {
            return $ui.data?.me;
        }),
    );
</script>

<AuthGuard behavior="login-with-return">
    <slot />
</AuthGuard>

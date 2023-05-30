<script lang="ts">
    import {UserInfoContext} from "../../../context/UserInfo.context";
    import AuthMenu from "./molecules/AuthMenu.svelte";

    const userInfo = UserInfoContext();
</script>

<div class="w-full flex justify-end items-center gap-4 text-xs">
    <!-- Auth Menu -->
    <AuthMenu />
</div>

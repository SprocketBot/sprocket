<script lang="ts">
    import {UserInfoStore} from "$houdini";
    import {UserInfoContext} from "$lib/context/UserInfo.context";
    const userInfo = UserInfoContext();
</script>

Hello {$userInfo?.name}

<script lang="ts">
    import {UserInfoContext} from "$lib/api";
    const userInfo = UserInfoContext();
</script>

Hello {$userInfo?.name}

<script lang="ts">
    import {ArrowLeftOnRectangle, ArrowRightOnRectangle, Bars3, Identification} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {goto} from "$app/navigation";
    import {AuthGuard, Avatar, Button, Dropdown, ListGroup, ListGroupItem} from "$lib/components";
    import {UserInfoContext} from "$lib/context/UserInfo.context";

    const userInfo = UserInfoContext();
</script>

<Dropdown transparent anchor="right">
    <div slot="handle" class="flex gap-4 items-center justify-center px-2">
        <span class="text-gray-50 font-bolder text-md">
            {$userInfo?.name}
        </span>

        <Avatar url={$userInfo?.currentOrganization?.logoUrl ?? ""} alt={$userInfo?.name ?? "Avatar"} />
    </div>
    <ListGroup fullWidth>
        <AuthGuard behavior="hide">
            <ListGroupItem class="text-danger" icon={ArrowLeftOnRectangle} on:click={() => goto("/auth/logout")}>
                Logout
            </ListGroupItem>
            <ListGroupItem
                class="text-success"
                icon={ArrowRightOnRectangle}
                slot="unauthorized"
                on:click={() => goto("/auth/login")}
            >
                Login
            </ListGroupItem>
            {#if $userInfo?.organizations.length}
                <ListGroupItem
                    on:click={() => goto(`/auth/organization?next=${encodeURI(window.location.pathname)}`)}
                    icon={Identification}
                >
                    Change Org
                </ListGroupItem>
            {/if}
        </AuthGuard>
    </ListGroup>
</Dropdown>

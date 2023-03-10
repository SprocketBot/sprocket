import {load_UserInfo} from "$houdini";
import type {LayoutLoad} from "./$types";

export const load: LayoutLoad = async e => {
    return {userInfo: (await load_UserInfo({event: e})).UserInfo};
};

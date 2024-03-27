// This interface was pulled from @types/passport-steam, which
// for some reason does not export this interface.
export interface SteamProfile {
  provider: 'steam';
  _json: {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    commentpermission: number;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    lastlogoff: number;
    personastate: number;
    realname: string;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
    loccountrycode: string;
    locstatecode: string;
  };
  id: string;
  displayName: string;
  photos: Array<{ value: string }>;
}

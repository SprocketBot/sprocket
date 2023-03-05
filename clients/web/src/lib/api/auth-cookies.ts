import { setCookie, removeCookie, getCookie } from "typescript-cookie";

const ACCESS_COOKIE_KEY = "sprocket-access-token";
const REFRESH_COOKIE_KEY = "sprocket-refresh-token";
export const updateAuthCookies = ({access, refresh}: { access: string, refresh: string}) => {
  // TODO: Should these cookies expire when the tokens themselves do?
  //       That may create a pretty easy mechanism for checking if the tokens themselves have expired.

  setCookie(ACCESS_COOKIE_KEY, access, {path: "/"});
  setCookie(REFRESH_COOKIE_KEY, refresh, {path: "/"});
}
export const clearAuthCookies = () => {
  removeCookie(ACCESS_COOKIE_KEY, { path: "/"} )
  removeCookie(REFRESH_COOKIE_KEY, { path: "/"} )
}

export const getAuthCookies = () => {
  return {
    access: getCookie(ACCESS_COOKIE_KEY),
    refresh: getCookie(REFRESH_COOKIE_KEY)
  }
}

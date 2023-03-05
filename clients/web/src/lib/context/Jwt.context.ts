import { getContext, setContext } from "svelte"

export type JwtContextValue = {
  access?: string
  refresh?: string
}
const JwtContextKey = "JWT_CONTEXT_KEY"


export const JwtContext = () => getContext<JwtContextValue>(JwtContextKey)
export const SetJwtContext = (v: JwtContextValue) => setContext<JwtContextValue>(JwtContextKey, v)

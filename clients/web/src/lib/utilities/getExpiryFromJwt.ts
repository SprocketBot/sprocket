import jwtDecode from "jwt-decode";

export const getExpiryFromJwt = (jwt: string) =>
    new Date(Number.parseInt(jwtDecode<{exp: number | string}>(jwt).exp.toString()) * 1000);

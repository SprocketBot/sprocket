import KnexClient from "knex";
import config from "$src/config";


export const knexClient = KnexClient({
    client: "pg",
    connection: {
        ...config.knex,
        ssl: false,
//         ssl: {
//             rejectUnauthorized: false,
//             ca: `-----BEGIN CERTIFICATE-----
// MIIEQTCCAqmgAwIBAgIUO4Ew0RydGu4vyT3MHABNBywJLNAwDQYJKoZIhvcNAQEM
// BQAwOjE4MDYGA1UEAwwvOGE3OWRlZGQtNWQ0OS00NDFhLThiZWEtMTAzMmJhYTJh
// MDQzIFByb2plY3QgQ0EwHhcNMjExMTAxMTY1OTE3WhcNMzExMDMwMTY1OTE3WjA6
// MTgwNgYDVQQDDC84YTc5ZGVkZC01ZDQ5LTQ0MWEtOGJlYS0xMDMyYmFhMmEwNDMg
// UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBANpHTh9z
// D06773DLKFNlKR2t4ZxxB2MWb51gFHfG8YpoflA8WzH/gcJr91/NE01yM1/GiE3v
// DD7g05b2481XS1KHSzDm9MeFEs78TFvK4RLD2rSuWXMMicj3OSp0SjqiH/YLiawg
// DrH6NxCgkJZeaW/9R1IK7irXpGN5TyaJOePu2geHa9lYdFEzid2y/yVi4eJIJyo5
// +cgW6eyfltj+OayFgH6GJxp+NL2hKCMDMXedDAsd0a3TTh5R5erEWppzBU6CX69y
// b0tkiBJyTdwJFym7eBAfBd4JBfsq98uFd7W6H34IWv1pK6Cj329PFLHFOWxFO3s1
// ojJzvOce4Dm+gtSm9bDoML724y6NZZGN6T1ZKRIaZ8wtnKPa+zHYSBmQ7i85I++X
// hZh3I2o8+P0W4mRmiP9twk/RsqJS9qlgJE2eJEiD96zgz66RgatUXNyNFC9jPLbg
// JArpba/qoaWQJppUf+6Fc0zRgjpgc3NT7SDschODqs4lPwL4Yns5ZJYLrwIDAQAB
// oz8wPTAdBgNVHQ4EFgQUL7p6kXZhym5KDFXzR73pJAKN5NEwDwYDVR0TBAgwBgEB
// /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAAtrvqRIthlQUdKu
// ZoHNqcRGKFUtNxrY/Th7N5uBwK9nOA6ALup/E+711sE23qUbi28TnBnQH5t4Gwn5
// DDaXLg2UAi5JK4khKOSC6GOgJvBBEvn79NpyIkzq4/wW2pzI9ISou464mQOxcRFP
// KEoF82GtEq4HrDQPLNlIVLXbT2rWijTjKJ4V/gDvd4SKTSbUHTIFit8RmxZjz0wV
// jdu+4xZB8Q4s+rcDYDhLvEn4C4jNlBd9QS6e8ek0yPUcJUH9jKOOK+KLSxSTsnSO
// nj1pcBsdSX1meC60NQYcb8IpA/P0W3p/Ff6wL0EDacyOjkDuhpH+917Yk/eBr6Ae
// cZeXKlEjWu8UuzRPTHYDHzx0rFn7OCmNxWxy9x4FfIC+bMgTd0qssmtjV6DVcRDP
// XasS1dWpQBDAtUrPvp/jkq/0yAxLwES662PAIc7srtwDIjt6T/V9+NOYpQFsog/I
// 9CIkM6KJMg0QczW1wtw4OEW2Bs/UB2bn+q7KPQvFZwV6KUBofw==
// -----END CERTIFICATE-----`,
//         },
    },
    asyncStackTraces: true,
    debug: false,
    pool: {
        min: 2,
        max: 2,
    },
});

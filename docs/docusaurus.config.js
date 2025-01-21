// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Sprocket Documentation",
  tagline: "Documentation for the Sprocket platform",
  favicon: "img/favicon.ico",
  url: "https://sprocketbot.github.io",
  baseUrl: "/sprocket/",
  organizationName: "sprocketbot",
  projectName: "sprocket",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/sprocketbot/sprocket/tree/main/docs/",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Sprocket Docs",
        logo: {
          alt: "Sprocket Logo",
          src: "img/logo.svg",
          href: "/sprocket/docs",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "sprocketSidebar",
            position: "left",
            label: "Documentation",
          },
          {
            href: "https://github.com/sprocketbot/sprocket",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Getting Started",
                to: "/docs/getting-started",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/hJ3YAvHucb",
              },
              {
                label: "GitHub",
                href: "https://github.com/sprocketbot/sprocket",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sprocket. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;

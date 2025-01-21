/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sprocketSidebar: [
    "index",
    "getting-started",
    {
      type: "category",
      label: "Core",
      items: [
        "core/authorization",
        {
          type: "category",
          label: "GraphQL API",
          items: [
            "core/graphql/overview",
            "core/graphql/game-resolver",
            "core/graphql/game-mode-resolver",
            "core/graphql/skill-group-resolver",
            "core/graphql/scrim-resolver",
            "core/graphql/user-auth-account-resolver",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;

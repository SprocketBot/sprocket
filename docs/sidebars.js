/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'getting-started',
    {
      type: 'category',
      label: 'Core',
      items: ['core/overview', 'core/module', 'core/service', 'core/types'],
    },
    {
      type: 'category',
      label: 'Authentication',
      items: ['auth/overview', 'auth/guards', 'auth/jwt'],
    },
    {
      type: 'category',
      label: 'GraphQL',
      items: ['graphql/overview', 'graphql/resolvers'],
    },
  ],
};

module.exports = sidebars;

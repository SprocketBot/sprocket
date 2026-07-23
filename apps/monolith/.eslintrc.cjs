module.exports = {
  root: true,
  extends: ["../../core/.eslintrc.cjs"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
};

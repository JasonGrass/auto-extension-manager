module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  bracketSameLine: true,
  importOrder: [
    "^react(.*)",
    "antd/(.*)",
    "<THIRD_PARTY_MODULES>",
    ".*.css$",
    "@/(.*)",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}

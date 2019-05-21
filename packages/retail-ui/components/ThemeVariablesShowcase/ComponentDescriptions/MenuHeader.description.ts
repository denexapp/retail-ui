export default {
  withLeftPadding: {
    contents: "css`\n  .${styles.root}& {\n    padding-left: ${t.menuItemPaddingForIcon};\n  }\n`",
    variables: [
      "menuItemPaddingForIcon"
    ]
  }
};
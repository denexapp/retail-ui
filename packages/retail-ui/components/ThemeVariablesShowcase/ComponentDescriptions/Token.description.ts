export default {
  warning: {
    contents: "css`\n  .${styles.token}& {\n    border: 1px solid ${t.borderColorWarning};\n    box-shadow: 0 0 0 1px ${t.borderColorWarning};\n  }\n`",
    variables: [
      "borderColorWarning"
    ]
  },
  error: {
    contents: "css`\n  .${styles.token}& {\n    border: 1px solid ${t.borderColorError};\n    box-shadow: 0 0 0 1px ${t.borderColorError};\n  }\n`",
    variables: [
      "borderColorError"
    ]
  }
};
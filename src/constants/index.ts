export const openInDefaultIndicatorStyle = `
.internal-embed::after {
  content: "open in default app";
  display: block;
  margin-top: 5px;
  background: var(--background-secondary);
  color: var(--text-normal);
  padding: 5px 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid var(--background-modifier-border-hover);
  border-radius: var(--radius-m);
  cursor: pointer;
}

.pdf-container,
.pdf-toolbar {
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--radius-s);
}

.pdf-container {
  border-top: 0px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.pdf-toolbar {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.internal-embed.pdf-embed {
  border: none;
}

.internal-embed {
  margin-bottom: 24px;
}
`;

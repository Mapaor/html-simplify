function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightTag(tag) {
  const escapedTag = escapeHtml(tag);
  const match = escapedTag.match(/^(&lt;\/?)([\w:-]+)([\s\S]*?)(\/?&gt;)$/);
  if (!match) return escapedTag;

  const attributes = match[3].replace(
    /([\w:-]+)(=)("[^"]*"|'[^']*')/g,
    (attribute, name, equals, value) => {
      const attributeClass = name === "id" ? "html-id" : name === "class" ? "html-class" : "html-attribute";
      const valueClass = name === "id" ? "html-id-value" : name === "class" ? "html-class-value" : "html-string";
      return `<span class="${attributeClass}">${name}</span>${equals}<span class="${valueClass}">${value}</span>`;
    },
  );
  return `${match[1]}<span class="html-tag">${match[2]}</span>${attributes}${match[4]}`;
}

function highlightHtml(html) {
  const parts = html.split(/(<!--[\s\S]*?-->|<\/?[\w:-]+(?:\s[^<>]*?)?\/?>)/g);
  return parts
    .map((part) => {
      if (part.startsWith("<!--")) return `<span class="html-comment">${escapeHtml(part)}</span>`;
      if (part.startsWith("<")) return highlightTag(part);
      return `<span class="html-text">${escapeHtml(part)}</span>`;
    })
    .join("");
}

window.HtmlHighlighter = { highlight: highlightHtml };

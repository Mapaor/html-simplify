const REMOVED_TAGS = new Set(["svg", "script", "style", "noscript", "template", "iframe", "canvas"]);
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const ALLOWED_ATTRIBUTES = {
  a: new Set(["href", "target", "rel", "aria-label"]),
  img: new Set(["src", "alt", "width", "height"]),
  input: new Set(["type", "name", "placeholder", "value", "checked", "disabled"]),
  button: new Set(["type", "name", "disabled", "aria-label"]),
  label: new Set(["for"]),
  form: new Set(["action", "method"]),
};

function getAttributes(element) {
  const attributes = [];
  for (const attribute of element.attributes) {
    const name = attribute.name.toLowerCase();
    if (name === "id" || name === "class" || ALLOWED_ATTRIBUTES[element.tagName.toLowerCase()]?.has(name)) {
      attributes.push(`${name}="${escapeAttribute(attribute.value)}"`);
    }
  }
  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function simplifyNode(node, depth) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.replace(/\s+/g, " ").trim();
    return text ? `${"  ".repeat(depth)}${escapeText(text)}` : "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tagName = node.tagName.toLowerCase();
  if (REMOVED_TAGS.has(tagName)) return "";

  const children = Array.from(node.childNodes)
    .map((child) => simplifyNode(child, depth + 1))
    .filter(Boolean);
  const openingTag = `<${tagName}${getAttributes(node)}>`;
  const indent = "  ".repeat(depth);

  if (VOID_TAGS.has(tagName)) return `${indent}${openingTag}`;
  if (!children.length) return `${indent}${openingTag}</${tagName}>`;

  const hasOnlyText = children.length === 1 && !node.children.length;
  if (hasOnlyText) return `${indent}${openingTag}${children[0].trim()}</${tagName}>`;

  return `${indent}${openingTag}\n${children.join("\n")}\n${indent}</${tagName}>`;
}

function simplifyHtml(html) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const elements = Array.from(document.body.children).filter(
    (element) => !REMOVED_TAGS.has(element.tagName.toLowerCase()),
  );

  return elements.map((element) => simplifyNode(element, 0)).filter(Boolean).join("\n");
}

function validateHtmlFragment(html) {
  if (!html.trim()) return { valid: false, message: "" };

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const hasElement = document.body.children.length > 0;
  const parserError = document.querySelector("parsererror");

  if (parserError || !hasElement) {
    return { valid: false, message: "That doesn’t look like an HTML fragment." };
  }
  return { valid: true, message: "Valid HTML fragment" };
}

window.HtmlSimplifier = { simplifyHtml, validateHtmlFragment };
export function svgStringToPreviewEl(svgString: string): SVGElement {
  const parser = new DOMParser();
  const newEl = parser.parseFromString(svgString, 'image/svg+xml').children[0];

  if (newEl.nodeName === 'svg' && newEl instanceof SVGElement) {
    return newEl;
  }
  throw new Error('SVG string not parsable');
}

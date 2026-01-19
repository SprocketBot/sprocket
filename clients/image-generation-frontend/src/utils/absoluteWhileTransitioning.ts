export const absoluteWhileTransitioning = (node: HTMLElement): void => {
  let originalPosition = node.style.position || undefined;
  let originalWidth = node.style.width;
  const start = () => {
    originalPosition = node.style.position || undefined;
    originalWidth = node.style.width || undefined;
    node.style.position = 'absolute';
    node.style.width = '100%';
  };
  const end = () => {
    node.style.position = originalPosition;
    node.style.width = originalWidth;
  };
  node.addEventListener('introstart', start);
  node.addEventListener('introend', end);

  node.addEventListener('outrostart', start);
  node.addEventListener('outroend', end);
};

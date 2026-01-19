export function screamingSnakeToHuman(text: string): string {
  return text
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

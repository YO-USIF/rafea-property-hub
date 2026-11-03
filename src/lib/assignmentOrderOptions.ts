// Keep saved names selectable even when the current catalogue no longer contains them.
export function assignmentOrderContractorNames(savedName: string, names: string[]): string[] {
  return Array.from(new Set([savedName, ...names].filter(name => name.trim() !== '')));
}
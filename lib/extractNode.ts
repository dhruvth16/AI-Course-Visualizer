export function extractNodesFromMermaid(
  mermaidCode: string
): { id: string; label: string }[] {
  const nodeRegex = /([A-Za-z0-9_]+)\s*\[([^\]]+)\]/g;
  const nodes: { id: string; label: string }[] = [];

  let match: RegExpExecArray | null;

  while ((match = nodeRegex.exec(mermaidCode)) !== null) {
    const nodeId = match[1];
    const label = match[2].trim();
    nodes.push({ id: nodeId, label });
  }

  return nodes;
}

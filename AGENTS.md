# AGENTS.md

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

### When answering codebase questions
If `graphify-out/graph.json` exists, treat the question as a graphify query first. Run `graphify query "<question>"` (BFS, or `--dfs` to trace a specific path) and answer using the graph before falling back to grep/read. Quote `source_location` when citing a fact.

### After code changes
After non-trivial edits (new file, deleted file, renamed symbol, or >5 files touched), run `graphify --update` to re-extract only changed files and rebuild the graph. Doc/image changes require a full `/graphify .` rebuild — `--update` only re-queues code.

### Commands
- `graphify query "<q>"` — answer from graph (BFS)
- `graphify query "<q>" --dfs` — trace a specific path
- `graphify path "NodeA" "NodeB"` — shortest path between concepts
- `graphify explain "<node>"` — plain-language explanation of a node
- `graphify --update` — incremental rebuild (code only)
- `graphify .` — full rebuild

### Honesty rules
- If the graph is stale (last build date in `graphify-out/GRAPH_REPORT.md` predates recent changes), say so before answering.
- Never invent edges. If the graph lacks an answer, fall back to direct file reads and say the graph was insufficient.
- Surface `AMBIGUOUS` edges as uncertain — do not present them as fact.

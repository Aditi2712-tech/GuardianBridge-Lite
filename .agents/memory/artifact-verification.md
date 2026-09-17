---
name: Artifact verification
description: How to validate the workspace artifact outside and inside its managed preview workflow.
---

Use the artifact's managed workflow when running Vite production/build commands that require workflow-provided environment values such as PORT or BASE_PATH. Use the workspace typecheck as the standalone code validation step.

**Why:** Direct shell builds can fail before compiling application code when those workflow values are absent, while the managed preview supplies them.

**How to apply:** After code changes, run the workspace typecheck, restart the affected managed workflow, then verify the routed preview and API through the shared proxy.
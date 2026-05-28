## Summary

<!-- 1-2 sentences on what this changes and why. -->

## Changes

<!-- Bulleted list of the meaningful changes. Skip noise (formatting, dist/ rebuild). -->

-
-

## Checklist

- [ ] Ran `npm run build` and committed the updated `dist/` alongside source changes
- [ ] Smoke-tested the affected subcommand(s) end to end
- [ ] If the CLI surface changed, updated `SKILL.md`
- [ ] If the install path changed, updated `README.md`
- [ ] No new runtime dependencies (dev deps only is fine)

## Test plan

<!-- How a reviewer can verify this works. Include exact commands and expected output. -->

```bash
node dist/cli.js <subcommand> ...
```

Expected output:

```json
{ "..." }
```

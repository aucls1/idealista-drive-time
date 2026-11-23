# Contributing

Thanks for wanting to help! Bug reports, ideas and pull requests are all welcome.

## Reporting bugs and ideas

Open an [issue](https://github.com/aucls1/idealista-drive-time/issues/new/choose) using
the templates. For bugs, include the starting point (a nearby town is enough), the minutes,
what you expected and what happened, and any red error text from the popup.

**Never paste your OpenRouteService API key** in issues, screenshots or logs.

## Development setup

1. Fork and clone the repository.
2. Load the folder as an unpacked extension (see the README) and add your own ORS key in
   Options.
3. Run the tests:

   ```sh
   npm test
   ```

There is no build step: edit the files, then click ↻ on the extension in
`chrome://extensions`.

## Pull requests

1. Create a branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Keep changes focused — one topic per PR.
3. Add or update tests in `test/` for anything in `src/` (pure functions are easy to test).
4. Make sure `npm test` passes; CI runs it on every PR.
5. Describe what changed and how you tested it in the browser. Screenshots help for UI changes.

Commit messages: short imperative summary (`Add Spain URL mapping`), optionally following
[Conventional Commits](https://www.conventionalcommits.org/).

## Guidelines

- **Plain JavaScript, no build step, no runtime dependencies.** Manifest V3 forbids remote
  code, so any library must be vendored under `vendor/` with its license.
- **Depend only on idealista's public URL format**, never on its internal JavaScript or DOM.
- **No scraping or storing listings.**
- **No API keys or personal data in the code or tests.** Each user brings their own key.
- **The outline must always cover the reachable area** ("grow only"). See
  [docs/design.md](docs/design.md).
- UI text is Portuguese for now; translations are welcome.

## Good first contributions

- URL mapping for idealista.com (Spain) and idealista.it (Italy).
- Rent vs. buy selector.
- Translations of the popup and options page.

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).

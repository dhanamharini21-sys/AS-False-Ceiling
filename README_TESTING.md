E2E Test Instructions (Playwright)

Prerequisites
- Node.js 16+ installed
- Start your local server serving the project root, e.g. `npx http-server -c-1` or use VSCode Live Server (default URL: http://127.0.0.1:5500)

Install and run tests
1. Install dependencies:

```bash
npm install
npx playwright install
```

2. Run the headless E2E suite:

```bash
npm run test:e2e
```

3. Run in headed mode (visible browser):

```bash
npm run test:e2e:headed
```

4. Open the HTML report:

```bash
npm run test:e2e:report
```

Notes
- The tests assume your dev server is at `http://127.0.0.1:5500`. To change, set `BASE_URL` env var, e.g. `BASE_URL=http://localhost:8080 npm run test:e2e`.
- Tests interact with DOM selectors present in the repository; if you changed selectors, update `tests/e2e.spec.js` accordingly.

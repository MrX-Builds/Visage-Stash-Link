const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const executablePath = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  try {
    await page.setContent(`
      <!doctype html>
      <html><head></head><body>
        <div class="visage-performer-card" data-performer-id="external-123">
          <a class="visage-performer-name"
             href="https://stashdb.org/performers/external-123">Example Performer</a>
        </div>
      </body></html>
    `);

    await page.evaluate(() => {
      window.__queryOptions = null;
      window.__openedPath = null;
      window.__performers = [{ id: '42', name: 'Local Example Performer' }];
      window.PluginApi = {
        GQL: { FindPerformersDocument: { kind: 'Document' } },
        utils: {
          StashService: {
            getClient() {
              return {
                async query(options) {
                  window.__queryOptions = options;
                  return {
                    data: {
                      findPerformers: {
                        performers: window.__performers
                      }
                    }
                  };
                }
              };
            }
          }
        }
      };
      window.open = (url) => {
        window.__openedPath = url;
        return { opener: window };
      };
    });

    await page.addScriptTag({
      path: path.resolve(__dirname, '..', 'VisageStashLink', 'VisageStashLink.js')
    });
    await page.click('.visage-performer-name', { button: 'right' });
    const action = page.getByRole('menuitem', { name: 'Open Local Example Performer in local Stash' });
    await action.waitFor();

    const queryOptions = await page.evaluate(() => window.__queryOptions);
    if (queryOptions.variables.performer_filter.stash_id_endpoint.stash_id !== 'external-123') {
      throw new Error('The external performer ID was not passed to the GraphQL filter.');
    }
    if (queryOptions.variables.performer_filter.stash_id_endpoint.modifier !== 'EQUALS') {
      throw new Error('The GraphQL lookup does not use an exact external-ID match.');
    }
    if (queryOptions.fetchPolicy !== 'network-only') {
      throw new Error('The GraphQL lookup is not network-fresh.');
    }

    await action.click();
    const openedPath = await page.evaluate(() => window.__openedPath);
    if (openedPath !== '/performers/42') {
      throw new Error('The local performer profile route was not opened.');
    }

    await page.evaluate(() => {
      window.__performers = [];
      window.__openedPath = null;
    });
    await page.click('.visage-performer-name', { button: 'right' });
    await page.getByText('Not found in local Stash').waitFor();
    const externalAction = page.getByRole('menuitem', { name: 'Open performer on StashDB' });
    await externalAction.click();
    const openedExternalPath = await page.evaluate(() => window.__openedPath);
    if (openedExternalPath !== 'https://stashdb.org/performers/external-123') {
      throw new Error('The external Visage performer profile was not opened.');
    }

    console.log('PASS: local performer navigation and missing-local external fallback');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



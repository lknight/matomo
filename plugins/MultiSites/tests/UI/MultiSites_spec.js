/*!
 * Matomo - free/libre analytics platform
 *
 * Screenshot integration tests for MultiSites.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("MultiSitesTest", function () {
    this.timeout(0);

    var generalParams = 'idSite=1&period=year&date=2012-08-09';
    var selector = '#multisites,.expandDataTableFooterDrawer';

    var createdSiteId = null;

    before(async function() {
        var callback = function (error, response) {
            if (error) {
                done(error, response);
                return;
            }
            
            createdSiteId = response.value;
            done();
        };

        testEnvironment.callApi("SitesManager.addSite", {
            siteName: '%3CMy%20website%22%27%3E%3B%2C%3F with a very very very very long stupid name',
            urls: 'http%3A%2F%2Fpiwik.org'},
        callback);
    });

    after(async function() {
        if (createdSiteId) {
            testEnvironment.callApi("SitesManager.deleteSite", {idSite: createdSiteId}, done);
        }
    });

    it('should load the all websites dashboard correctly', async function() {
        await page.goto("?" + generalParams + "&module=MultiSites&action=index");
        await page.waitFor(500);
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector(selector)).to.matchImage('all_websites');
    });

    it('should load next page correctly', async function() {
        await page.click('.paging .next');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector(selector)).to.matchImage('all_websites_page_1');
    });

    it('should search correctly', async function() {
        await page.type('.site_search input', 'Site');
        await page.click('.site_search .search_ico');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector(selector)).to.matchImage('all_websites_search');
    });

    it('should toggle sort order when click on current metric', async function() {
        await page.click('#visits .heading');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector(selector)).to.matchImage('all_websites_changed_sort_order');
    });
});

/*!
 * Matomo - free/libre analytics platform
 *
 * UsersManager screenshot tests.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("UsersManager", function () {
    this.timeout(0);
    this.fixture = "Piwik\\Plugins\\UsersManager\\tests\\Fixtures\\ManyUsers";

    var url = "?module=UsersManager&action=index";

    async function assertScreenshotEquals(screenshotName, test)
    {
        await test(page);
        var content = await page.$('#content');
        expect(await content.screenshot()).to.matchImage(screenshotName);
    }

    async function openGiveAccessForm(page) {
        await page.click('#showGiveViewAccessForm');
    }

    async function setLoginOrEmailForGiveAccessForm(page, loginOrEmail)
    {
        await page.evaluate(function () {
            $('#user_invite').val('');
        });
        await page.type('#user_invite', loginOrEmail);
    }

    async function submitGiveAccessForm(page)
    {
        await page.click('#giveUserAccessToViewReports');
        await page.waitFor(500); // we wait in case error notification is still fading in and not fully visible yet
    }

    before(function () {
        testEnvironment.idSitesAdminAccess = [1,2];
        testEnvironment.save();
    });

    after(function () {
        delete testEnvironment.idSitesAdminAccess;
        testEnvironment.save();
    });

    it("should show only users having access to same site", async function() {
        await assertScreenshotEquals("loaded_as_admin", async function (page) {
            await page.goto(url);
        });
    });

    it("should open give view access form when clicking on button", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_form_opened", async function (page) {
            await openGiveAccessForm(page);
        });
    });

    it("should show an error when nothing entered", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_no_user_entered", async function (page) {
            await submitGiveAccessForm(page);
        });
    });

    it("should show an error when no such user found", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_user_not_found", async function (page) {
            await setLoginOrEmailForGiveAccessForm(page, 'anyNoNExistingUser');
            await submitGiveAccessForm(page);
        });
    });

    it("should show an error if user already has access", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_user_already_has_access", async function (page) {
            await setLoginOrEmailForGiveAccessForm(page, 'login2');
            await submitGiveAccessForm(page);
        });
    });

    it("should add a user by login", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_via_login", async function (page) {
            await setLoginOrEmailForGiveAccessForm(page, 'login3');
            await submitGiveAccessForm(page);
        });
    });

    it("should add a user by email", async function() {
        await assertScreenshotEquals("adminuser_give_view_access_via_email", async function (page) {
            await page.goto(url);
            await openGiveAccessForm(page);
            await setLoginOrEmailForGiveAccessForm(page, 'login4@example.com');
            await submitGiveAccessForm(page);
        });
    });

    it("should ask for confirmation when all sites selected", async function() {
        await assertScreenshotEquals("adminuser_all_users_loaded", async function (page) {
            page.goto(url + '&idSite=all');
        });
    });

    it("should ask for confirmation when all sites selected", async function() {
        await openGiveAccessForm(page);
        await setLoginOrEmailForGiveAccessForm(page, 'login5@example.com');
        await submitGiveAccessForm(page);

        var content = await page.$('.modal.open');
        expect(await content.screenshot()).to.matchImage('adminuser_all_users_confirmation');
    });
});
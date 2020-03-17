import { expect } from 'chai';
import { By, Key } from 'selenium-webdriver';

async function focus(ctx: Mocha.Context) {
  await ctx.browser.executeScript(() => {
    (window.document.querySelector("[data-comp-name~='DateInput']") as HTMLElement).focus();
  });
}

describe('DateInput', function() {
  describe('simple', function() {
    it('idle', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await new Promise(res => setTimeout(res, 500));
      await expect(await element.takeScreenshot()).to.matchImage('idle');
    });
    it('focus', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await expect(await element.takeScreenshot()).to.matchImage('focus');
    });
  });
  describe('disabled', function() {
    it('idle', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await expect(await element.takeScreenshot()).to.matchImage('idle');
    });
    it('focus', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await expect(await element.takeScreenshot()).to.matchImage('focus');
    });
  });
  describe('with width', function() {
    it('idle', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await expect(await element.takeScreenshot()).to.matchImage('idle');
    });
    it('focus', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await expect(await element.takeScreenshot()).to.matchImage('focus');
    });
  });
  describe('different formatting', function() {
    it('idle', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await expect(await element.takeScreenshot()).to.matchImage('idle');
    });
  });
  describe('blur always after change', function() {
    it('value not changed', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await this.browser
        .actions({
          bridge: true,
        })
        .click(this.browser.findElement(By.css('body')))
        .perform();
      await expect(await element.takeScreenshot()).to.matchImage('value not changed');
    });
    it('value changed', async function() {
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await this.browser
        .actions({
          bridge: true,
        })
        .sendKeys('12')
        .click(this.browser.findElement(By.css('body')))
        .perform();
      await expect(await element.takeScreenshot()).to.matchImage('value changed');
    });
    it('value restored', async function() {
      await this.browser.executeScript(() => {
        // @ts-ignore
        window.OldDate = window.Date;
        // @ts-ignore
        window.Date = function() {
          // @ts-ignore
          return new window.OldDate(2000, 0, 1);
        };
      });
      const element = await this.browser.findElement(By.css('#test-element'));
      await focus(this);
      await this.browser
        .actions({
          bridge: true,
        })
        .sendKeys(Key.DELETE)
        .click(this.browser.findElement(By.css('body')))
        .perform();
      // @ts-ignore
      await this.browser.executeScript(() => {
        // @ts-ignore
        if (window.OldDate) {
          // @ts-ignore
          window.Date = window.OldDate;
        }
      });
      await expect(await element.takeScreenshot()).to.matchImage('value restored');
    });
  });
});
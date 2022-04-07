import { expect, test } from '@playwright/test'

let pageA;
let pageB;

function getElements(page) {
  return {
    count: page.locator('[data-test-id="counterStoreCount"]'),
    increment: page.locator('[data-test-id="counterStoreIncrement"]'),
    decrement: page.locator('[data-test-id="counterStoreDecrement"]'),
    ignoreCount: page.locator('[data-test-id="counterStoreIgnoreCount"]'),
    ignoreIncrement: page.locator('[data-test-id="counterStoreIgnoreIncrement"]'),
    ignoreDecrement: page.locator('[data-test-id="counterStoreIgnoreDecrement"]'),
    payloadStoreResult: page.locator('[data-test-id="payloadStoreResult"]'),
    payloadStoreButtonString: page.locator('[data-test-id="payloadStoreButtonString"]'),
    payloadStoreButtonNumber: page.locator('[data-test-id="payloadStoreButtonNumber"]'),
    payloadStoreButtonObject: page.locator('[data-test-id="payloadStoreButtonObject"]'),
    payloadStoreButtonArray: page.locator('[data-test-id="payloadStoreButtonArray"]'),
    payloadStoreButtonNull: page.locator('[data-test-id="payloadStoreButtonNull"]'),
  }
}

test.beforeEach(async ({ context }) => {
  pageA = await context.newPage();
  pageB = await context.newPage();
  await pageA.goto('http://localhost:3000')
  await pageB.goto('http://localhost:3000')
})

test('Count', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await expect($pageElementsA.count, 'PageA have initial count').toContainText('0')
  await expect($pageElementsB.count, 'PageB have initial count').toContainText('0')

  await $pageElementsA.increment.click()

  await expect($pageElementsA.count, 'PageA have count 1').toContainText('1')
  await expect($pageElementsB.count, 'PageB have count 1').toContainText('1')

  await $pageElementsB.increment.click()
  await $pageElementsB.increment.click()
  await $pageElementsB.increment.click()

  await expect($pageElementsA.count, 'PageA have count 4').toContainText('4')
  await expect($pageElementsB.count, 'PageB have count 4').toContainText('4')

  await $pageElementsA.decrement.click()
  await $pageElementsB.decrement.click()

  await expect($pageElementsA.count, 'PageA have count 2').toContainText('2')
  await expect($pageElementsB.count, 'PageB have count 2').toContainText('2')
})

test('Ignore count', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await expect($pageElementsA.ignoreCount, 'PageA have initial ignoreCount').toContainText('0')
  await expect($pageElementsB.ignoreCount, 'PageB have initial ignoreCount').toContainText('0')

  await $pageElementsA.ignoreIncrement.click()

  await expect($pageElementsA.ignoreCount, 'PageA have ignoreCount 1').toContainText('1')
  await expect($pageElementsB.ignoreCount, 'PageB have ignoreCount 0').toContainText('0')

  await $pageElementsB.ignoreIncrement.click()
  await $pageElementsB.ignoreIncrement.click()
  await $pageElementsB.ignoreIncrement.click()

  await expect($pageElementsA.ignoreCount, 'PageA have ignoreCount 1').toContainText('1')
  await expect($pageElementsB.ignoreCount, 'PageB have ignoreCount 3').toContainText('3')

  await $pageElementsA.ignoreDecrement.click()
  await $pageElementsB.ignoreDecrement.click()

  await expect($pageElementsA.ignoreCount, 'PageA have ignoreCount 0').toContainText('0')
  await expect($pageElementsB.ignoreCount, 'PageB have ignoreCount 2').toContainText('2')
})

test('Payload String', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await $pageElementsA.payloadStoreButtonString.click();

  await expect($pageElementsA.payloadStoreResult, 'Payload is same')
    .toHaveText(await $pageElementsB.payloadStoreResult.innerText())
})

test('Payload Number', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await $pageElementsA.payloadStoreButtonNumber.click();

  await expect($pageElementsA.payloadStoreResult, 'Payload is same')
    .toHaveText(await $pageElementsB.payloadStoreResult.innerText())
})


test('Payload Object', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await $pageElementsA.payloadStoreButtonObject.click();

  await expect($pageElementsA.payloadStoreResult, 'Payload is same')
    .toHaveText(await $pageElementsB.payloadStoreResult.innerText())
})


test('Payload Array', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await $pageElementsA.payloadStoreButtonArray.click();

  await expect($pageElementsA.payloadStoreResult, 'Payload is same')
    .toHaveText(await $pageElementsB.payloadStoreResult.innerText())
})


test('Payload Null', async () => {
  const $pageElementsA = getElements(pageA);
  const $pageElementsB = getElements(pageB);

  await $pageElementsA.payloadStoreButtonNull.click();

  await expect($pageElementsA.payloadStoreResult, 'Payload is same')
    .toHaveText(await $pageElementsB.payloadStoreResult.innerText())
})


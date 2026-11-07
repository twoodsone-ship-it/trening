// Run with a local Playwright installation and `npm run dev -- --host 127.0.0.1`.
// Screenshots are written outside the repository by default.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const out = process.env.IRONFORGE_QA_OUT || path.join(os.tmpdir(), 'ironforge-round2-screenshots');
fs.mkdirSync(out, { recursive: true });
const sizes = [[360, 640], [844, 390], [768, 1024], [390, 844], [1280, 800], [320, 640]];
const seed = {
  activeProgram: { goal: 'strength', daysPerWeek: 3, gymProfile: 'full', title: 'План', startedAt: '2026-11-01T00:00:00.000Z', templateIds: ['t'], coreSessionsPerWeek: 0, cardioSessionsPerWeek: 0 }
};
const report = [];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    await page.addInitScript(value => {
      localStorage.setItem('ironforge_settings_v1', JSON.stringify({ ...value, focusModeDefault: true }));
      localStorage.setItem('ironforge_active_program_v1', JSON.stringify(value.activeProgram));
      localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 't', name: 'Тренировка А', description: 'Жим штанги лёжа', exercises: [{ id: 'bench-press', name: 'Жим штанги лёжа', category: 'Chest', equipment: 'barbell', targetSets: 3, minReps: 8, maxReps: 12, weightStep: 2.5, currentWeight: 60, restSeconds: 90, history: [] }] }]));
      const progression = { decision: 'INCREASE_REPS', nextWeight: 60, targetRepRange: '8-12', badgeText: 'Набор повторений', badgeColor: 'blue', analysis: '', suggestedAction: 'Добавьте повторение.', consecutivePlateauCount: 0 };
      localStorage.setItem('ironforge_history_v1', JSON.stringify([0, 1].map(index => ({
        id: `qa-${index}`, templateId: 't', templateName: 'Тренировка А', startTime: Date.UTC(2026, 10, 3 + index, 10), endTime: Date.UTC(2026, 10, 3 + index, 11),
        durationMinutes: 60, totalVolumeKg: 1800, totalSets: 3, exercises: [{ exerciseId: 'bench-press', name: 'Жим штанги лёжа', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12,
        workingWeight: 60, sets: [1, 2, 3].map(setNumber => ({ setNumber, weight: 60, reps: 10, type: 'working' })), progression }]
      }))));
    }, seed);

    await page.goto(process.env.IRONFORGE_QA_URL || 'http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);

    const safeTap = async locator => {
      await locator.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
      await locator.click(); // Strict check: NO force: true
    };

    const check = async screen => {
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(out, `${screen}-${width}x${height}.png`) });
      const result = await page.evaluate(() => {
        const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const targets = [...document.querySelectorAll('button, [role="button"]')].filter(visible).map(el => ({ text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 42), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) })).filter(item => item.width < 44 || item.height < 44);
        const tiny = [...document.querySelectorAll('body *')].filter(el => visible(el) && el.children.length === 0 && (el.textContent || '').trim() && parseFloat(getComputedStyle(el).fontSize) < 11).map(el => ({ text: el.textContent.trim().slice(0, 35), px: getComputedStyle(el).fontSize }));
        const smallInputs = [...document.querySelectorAll('input,select,textarea')].filter(visible).filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).map(el => ({ tag: el.tagName, px: getComputedStyle(el).fontSize }));
        const primary = [...document.querySelectorAll('button')].find(el => /Пробный подход выполнен/.test(el.textContent || ''));
        const primaryRect = primary?.getBoundingClientRect();
        const nav = document.querySelector('div.fixed.bottom-0');
        return { horizontalScroll: document.documentElement.scrollWidth > innerWidth, scrollWidth: document.documentElement.scrollWidth, targets: targets.slice(0, 25), tiny: tiny.slice(0, 25), smallInputs, primaryInViewport: primaryRect ? primaryRect.top >= 0 && primaryRect.bottom <= innerHeight : undefined, navWidth: nav?.getBoundingClientRect().width };
      });
      report.push({ screen, size: `${width}x${height}`, ...result });
    };

    // 1. Error Fallback Screen
    try {
      await page.goto((process.env.IRONFORGE_QA_URL || 'http://127.0.0.1:5173/') + '?trigger_error=1', { waitUntil: 'domcontentloaded' });
      await check('ErrorFallback');
    } catch (e) {
      report.push({ screen: 'ErrorFallback', size: `${width}x${height}`, error: String(e).slice(0, 200) });
    }

    // Return to main app
    await page.goto(process.env.IRONFORGE_QA_URL || 'http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);

    await check('Home');
    try {
      await safeTap(page.getByRole('button', { name: 'Аналитика' }));
      await check('Analytics');

      // History list expanded, edit modal, delete toast
      const historyCardBtn = page.locator('button[aria-expanded]').first();
      if (await historyCardBtn.count()) {
        await safeTap(historyCardBtn);
        await page.waitForTimeout(200);
        await check('HistoryList');

        const editBtn = page.getByRole('button', { name: /Редактировать/ }).first();
        if (await editBtn.count()) {
          await safeTap(editBtn);
          await page.waitForTimeout(200);
          await check('WorkoutEditModal');

          // J1: Interact with WorkoutEditModal inputs and RPE button without force
          const weightInput = page.locator('input[aria-label*="Вес для подхода"]').first();
          if (await weightInput.count()) {
            await safeTap(weightInput);
            await weightInput.fill('65');
          }

          const repsInput = page.locator('input[aria-label*="Повторения для подхода"]').first();
          if (await repsInput.count()) {
            await safeTap(repsInput);
            await repsInput.fill('11');
          }

          const rpeBtn = page.locator('button:has-text("RPE"), button:has-text("@")').first();
          if (await rpeBtn.count()) {
            await safeTap(rpeBtn);
            await page.waitForTimeout(200);
            await check('RpePickerModal');

            // Click RPE number button without force
            const rpe9Btn = page.getByRole('button', { name: '9', exact: true });
            if (await rpe9Btn.count()) {
              await safeTap(rpe9Btn);
            }

            // Click Save RPE without force
            const saveRpeBtn = page.getByRole('button', { name: /Сохранить RPE/ });
            if (await saveRpeBtn.count()) {
              await safeTap(saveRpeBtn);
              await page.waitForTimeout(200);
            }
          }

          // Click Cancel (Отмена) in WorkoutEditModal without force
          const cancelEditBtn = page.getByRole('button', { name: 'Отмена' });
          if (await cancelEditBtn.count()) {
            await safeTap(cancelEditBtn);
            await page.waitForTimeout(200);
          }
        }

        // Delete confirmation flow
        const deleteBtn = page.getByRole('button', { name: 'Удалить' }).first();
        if (await deleteBtn.count()) {
          await safeTap(deleteBtn);
          await page.waitForTimeout(200);

          // Click Cancel in delete confirmation
          const cancelDelete = page.getByRole('button', { name: 'Отмена' });
          if (await cancelDelete.count()) {
            await safeTap(cancelDelete);
            await page.waitForTimeout(200);
          }

          // Click Delete again
          await safeTap(deleteBtn);
          await page.waitForTimeout(200);

          const confirmDelete = page.getByRole('button', { name: 'Да, удалить' });
          if (await confirmDelete.count()) {
            await safeTap(confirmDelete);
            await page.waitForTimeout(300);
            await check('DeleteToast');

            // Test Undo button without force
            const undoBtn = page.getByRole('button', { name: /Отменить/ });
            if (await undoBtn.count()) {
              await safeTap(undoBtn);
              await page.waitForTimeout(200);
            }
          }
        }
      }

      await safeTap(page.getByRole('button', { name: 'Ещё' }));
      await check('Settings');
      await safeTap(page.getByRole('button', { name: 'Закрыть', exact: true }).last());
      await safeTap(page.getByRole('button', { name: 'Главная' }));
      await safeTap(page.getByRole('button', { name: 'Начать тренировку' }));
      await safeTap(page.getByRole('button', { name: /В ресурсе/ }));
      await page.waitForTimeout(100);
      await check('FocusSetOverlay');
      await safeTap(page.getByRole('button', { name: 'Закрыть', exact: true }).last());
      await check('ActiveWorkout');
      await safeTap(page.getByRole('button', { name: 'Начать сет' }));
      await safeTap(page.getByRole('button', { name: /Пробный подход выполнен/ }));
      await page.waitForTimeout(100);
      await check('RestTimer');

      if (width === 360 && height === 640) {
        await safeTap(page.getByRole('button', { name: 'Пропустить отдых' }));
        await page.waitForTimeout(200);
        const focusClose = page.locator('[class*="z-[220]"] button[aria-label="Закрыть"]');
        if (await focusClose.count()) await safeTap(focusClose);
        await page.evaluate(() => {
          const original = Storage.prototype.setItem;
          Storage.prototype.setItem = function(key, value) {
            if (key === 'ironforge_history_v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
            return original.call(this, key, value);
          };
        });
        const confettiBefore = await page.locator('canvas').count();
        await safeTap(page.getByRole('button', { name: 'Завершить' }));
        const firstFailure = await page.getByRole('alert').getByText('Не удалось сохранить тренировку', { exact: false }).isVisible();
        await safeTap(page.getByRole('button', { name: 'Закрыть ошибку' }));
        await safeTap(page.getByRole('button', { name: 'Завершить' }));
        const retryFailure = await page.getByRole('alert').getByText('Не удалось сохранить тренировку', { exact: false }).isVisible();
        report.push({ screen: 'SaveFailure', size: `${width}x${height}`, firstFailure, retryFailure, noConfetti: await page.locator('canvas').count() === confettiBefore });
      }
    } catch (error) {
      report.push({ size: `${width}x${height}`, error: String(error?.stack || error) });
    }
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.map(({ screen, size, horizontalScroll, targets, tiny, error }) => ({ screen, size, horizontalScroll, targets: targets?.length, tiny: tiny?.length, error })), null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });

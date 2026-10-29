import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 1,
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  admin1: 'SP',
  country: 'Brasil',
};

const matchingCities = [
  {
    ...city,
    id: 2,
    name: 'Springfield',
    latitude: 39.78,
    longitude: -89.64,
    admin1: 'Illinois',
    country: 'Estados Unidos',
  },
  {
    ...city,
    id: 3,
    name: 'Springfield',
    latitude: 42.1,
    longitude: -72.59,
    admin1: 'Massachusetts',
    country: 'Estados Unidos',
  },
];

const forecast = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-10-29T13:15',
    temperature_2m: 0,
    relative_humidity_2m: 60,
    wind_speed_10m: 10,
    precipitation: 0,
    surface_pressure: 920,
    weather_code: 0,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    temperature_2m_min: [0, 5, 10, 15, 20],
    temperature_2m_max: [100, 25, 30, 35, 40],
    precipitation_probability_max: [10, 25, 60, 80, 5],
    weather_code: [0, 1, 2, 3, 61],
  },
};

async function mockWeatherApis(page: Page) {
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: { results: [city] } }),
  );
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) =>
    route.fulfill({ json: forecast }),
  );
}

async function selectCity(page: Page) {
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'São Paulo, SP, Brasil' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/(geocoding-api|api)\.open-meteo\.com\//, (route) =>
    route.abort('blockedbyclient'),
  );
  await page.clock.install({ time: new Date('2026-10-29T16:15:00Z') });
});

test('busca, seleciona uma cidade, consulta cinco dias e alterna a unidade', async ({ page }) => {
  let forecastRequests = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.open-meteo.com/v1/forecast')) forecastRequests += 1;
  });
  await mockWeatherApis(page);
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'São Paulo, SP, Brasil' }).click();

  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current.getByText('0 °C')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(current.getByText('32 °F')).toBeVisible();
  await expect(page.getByRole('article').first().getByText('212 °F')).toBeVisible();
  await expect(page.getByRole('main').getByText(/^-?[\d,]+ °F$/)).toHaveCount(11);
  await page.getByRole('button', { name: 'Celsius' }).click();
  await expect(current.getByText('0 °C')).toBeVisible();
  expect(forecastRequests).toBe(1);

  await page.getByRole('button', { name: 'Atualizar clima' }).click();
  await expect(current).toBeVisible();
  expect(forecastRequests).toBe(2);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Celsius' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('busca e alternância de unidade funcionam apenas com teclado', async ({ page }) => {
  await mockWeatherApis(page);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo principal' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('searchbox', { name: 'Cidade' })).toBeFocused();
  await page.keyboard.type('São Paulo');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'São Paulo, SP, Brasil' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'São Paulo, SP, Brasil' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Celsius' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toBeFocused();
  await expect(page.getByRole('region', { name: 'Clima atual' }).getByText('32 °F')).toBeVisible();
});

test('exige seleção entre cidades homônimas e consulta as coordenadas escolhidas', async ({
  page,
}) => {
  const requestedCoordinates: string[] = [];
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: { results: matchingCities } }),
  );
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) => {
    const url = new URL(route.request().url());
    requestedCoordinates.push(
      `${url.searchParams.get('latitude')},${url.searchParams.get('longitude')}`,
    );
    return route.fulfill({ json: forecast });
  });
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Springfield');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const illinois = page.getByRole('button', { name: 'Springfield, Illinois, Estados Unidos' });
  const massachusetts = page.getByRole('button', {
    name: 'Springfield, Massachusetts, Estados Unidos',
  });
  await expect(illinois).toHaveAttribute('aria-pressed', 'false');
  await expect(massachusetts).toHaveAttribute('aria-pressed', 'false');
  expect(requestedCoordinates).toEqual([]);

  await massachusetts.click();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  expect(requestedCoordinates).toEqual(['42.1,-72.59']);
});

test('busca sem resultados não inicia consulta meteorológica', async ({ page }) => {
  let forecastRequests = 0;
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecast });
  });
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  expect(forecastRequests).toBe(0);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`fluxo principal cabe no viewport de ${width} pixels`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await mockWeatherApis(page);
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.getByRole('button', { name: 'São Paulo, SP, Brasil' }).click();

    await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

test('entrada vazia ou só espaços não gera consulta', async ({ page }) => {
  let requests = 0;
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\//, (route) => {
    requests += 1;
    return route.fulfill({ json: {} });
  });
  await page.goto('/');
  const input = page.getByRole('searchbox', { name: 'Cidade' });
  for (const value of ['', '   ']) {
    await input.fill(value);
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    await input.press('Enter');
  }
  expect(requests).toBe(0);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('preserva acentos, espaços, hífen e apóstrofo na consulta', async ({ page }) => {
  const name = "São José-d'Oeste";
  let receivedName: string | null = null;
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\//, (route) => {
    receivedName = new URL(route.request().url()).searchParams.get('name');
    return route.fulfill({ json: { results: [{ ...city, name }] } });
  });
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(name);
  await page.getByRole('searchbox', { name: 'Cidade' }).press('Enter');
  await expect(page.getByRole('button', { name: `${name}, SP, Brasil` })).toBeVisible();
  expect(receivedName).toBe(name);
  await expect(page.getByRole('main')).toBeFocused();
});

test('geocoding sem results mostra vazio e mantém a busca disponível', async ({ page }) => {
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\//, (route) =>
    route.fulfill({ json: {} }),
  );
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
});

test('falha offline no forecast permite retry sem repetir a geocodificação', async ({ page }) => {
  await mockWeatherApis(page);
  let attempts = 0;
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) => {
    attempts += 1;
    return attempts === 1 ? route.abort('internetdisconnected') : route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await selectCity(page);
  await expect(page.getByRole('alert')).toContainText('Verifique sua conexão');
  await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
  expect(attempts).toBe(1);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('timeout em 10 segundos encerra loading sem retry automático', async ({ page }) => {
  await mockWeatherApis(page);
  let attempts = 0;
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, async (route) => {
    attempts += 1;
    if (attempts > 1) await route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await selectCity(page);
  await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => attempts).toBe(1);
  await page.clock.fastForward(10_000);
  await expect(page.getByRole('alert')).toContainText('10 segundos');
  await page.clock.fastForward(10_000);
  expect(attempts).toBe(1);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  expect(attempts).toBe(2);
});

for (const section of ['current', 'daily'] as const) {
  test(`seção ${section} ausente preserva a outra seção`, async ({ page }) => {
    await mockWeatherApis(page);
    await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) =>
      route.fulfill({ json: { ...forecast, [section]: null } }),
    );
    await page.goto('/');
    await selectCity(page);
    await expect(page.getByText('Alguns dados meteorológicos estão indisponíveis.')).toBeVisible();
    if (section === 'current') {
      await expect(page.getByText('Clima atual indisponível')).toBeVisible();
      await expect(page.getByRole('article')).toHaveCount(5);
    } else {
      await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
      await expect(page.getByText('Previsão indisponível')).toBeVisible();
    }
    await expect(page.locator('body')).not.toContainText(/\b(NaN|undefined|Infinity)\b/);
  });
}

test('campos nulos são indisponíveis e código desconhecido tem fallback pt-BR', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await mockWeatherApis(page);
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) =>
    route.fulfill({
      json: {
        ...forecast,
        current: { time: null, temperature_2m: 0, weather_code: 999 },
        daily: { ...forecast.daily, temperature_2m_min: null, temperature_2m_max: null },
      },
    }),
  );
  await page.goto('/');
  await selectCity(page);
  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current.getByText('Condição indisponível')).toBeVisible();
  await expect(current.getByText('Indisponível', { exact: true })).toHaveCount(4);
  await expect(current.getByText('Horário indisponível')).toBeVisible();
  await expect(page.getByRole('article').getByText('Indisponível', { exact: true })).toHaveCount(
    10,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

import { app, safeStorage } from 'electron'
import Store from 'electron-store'

app.setName('yandex-metrics-app')

async function testMetric(token, counterId, metrics) {
  const url = new URL('https://api-metrika.yandex.net/stat/v1/data')
  url.searchParams.set('id', String(counterId))
  url.searchParams.set('date1', '2025-05-01')
  url.searchParams.set('date2', '2025-05-31')
  url.searchParams.set('metrics', metrics)
  url.searchParams.set('dimensions', 'ym:s:date')
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `OAuth ${token}` },
  })
  const text = await res.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = text
  }
  return { status: res.status, ok: res.ok, parsed }
}

async function main() {
  await app.whenReady()
  const store = new Store({ name: 'yandex-metrics-auth' })
  const encryptedToken = store.get('encryptedToken')
  const token = safeStorage.decryptString(Buffer.from(encryptedToken, 'base64'))
  const counterId = 10849417

  const candidates = [
    'ym:s:purchases',
    'ym:s:orders',
    'ym:s:ecommercePurchases',
    'ym:s:ecommerceAdd',
    'ym:s:ecommerceAddToCart',
    'ym:s:ecommerceCart',
    'ym:s:ecommerceDetail',
    'ym:s:ecommerceCheckout',
    'ym:s:ecommercePurchase',
    'ym:s:ecommerceRemove',
    'ym:s:ecommerceBeginCheckout',
    'ym:s:ecommerceAddToCarts',
    'ym:s:addToCart',
    'ym:s:revenue',
    'ym:s:ecommerceRevenue',
  ]

  for (const m of candidates) {
    const r = await testMetric(token, counterId, m)
    const total = r.ok ? r.parsed?.totals : null
    console.log(`${m}: ${r.ok ? 'OK' : 'ERR ' + r.status} totals=${JSON.stringify(total)}`)
  }
  app.exit(0)
}

main().catch((err) => {
  console.error(err)
  app.exit(1)
})

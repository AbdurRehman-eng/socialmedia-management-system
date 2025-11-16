// Script to fetch all services and display prices per 1000

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

// Default settings from database
const DEFAULT_MARKUP = 1.5  // 50% markup
const COIN_TO_PHP_RATE = 1   // 1 coin = 1 PHP
const USD_TO_PHP_RATE = 50   // 1 USD = 50 PHP (configurable by admin)

interface Service {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

async function fetchServices(): Promise<Service[]> {
  try {
    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    formData.append("action", "services")

    const response = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" 
      },
      body: formData.toString(),
    })

    const data = await response.json() as Service[]
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

function calculatePrice(providerRateInUsdPerUnit: number): number {
  // Provider rate is in USD per 1 unit
  // Formula: 
  //   1. Convert to per 1000: providerRatePer1000 = providerRatePerUnit × 1000
  //   2. Convert USD to PHP: providerRateInPhp = providerRatePer1000 × USD_TO_PHP_RATE
  //   3. Apply markup: YOUR_PRICE = providerRateInPhp × 1.5 (add 50% markup)
  // Example: If provider rate = $0.05 per unit, USD→PHP = 50, markup = 1.5
  //          Per 1000 units = $0.05 × 1000 = $50.00 per 1000
  //          Provider in PHP = $50.00 × 50 = ₱2500.00 per 1000
  //          Your price = ₱2500.00 × 1.5 = ₱3750.00 per 1000
  //          Your profit = ₱1250.00 per 1000
  const providerRateInUsdPer1000 = providerRateInUsdPerUnit * 1000
  const providerRateInPhpPer1000 = providerRateInUsdPer1000 * USD_TO_PHP_RATE
  return providerRateInPhpPer1000 * DEFAULT_MARKUP * COIN_TO_PHP_RATE
}

async function main() {
  console.log("Fetching services from provider...\n")
  
  const services = await fetchServices()
  
  if (services.length === 0) {
    console.log("No services found or error fetching services.")
    return
  }

  console.log(`Found ${services.length} services\n`)
  console.log("=" .repeat(100))
  console.log("SERVICE PRICES PER 1000 UNITS")
  console.log("=" .repeat(100))
  console.log(`Currency: Philippine Pesos (₱)`)
  console.log(`USD to PHP Rate: 1 USD = ₱${USD_TO_PHP_RATE}`)
  console.log(`Default Markup: ${DEFAULT_MARKUP}x (${((DEFAULT_MARKUP - 1) * 100).toFixed(0)}% markup)`)
  console.log(`Coin Rate: 1 coin = ₱${COIN_TO_PHP_RATE}`)
  console.log()
  console.log("PRICING FORMULA:")
  console.log("  1. Per 1000: PROVIDER RATE (USD/unit) × 1000 = PROVIDER RATE (USD/1000)")
  console.log("  2. Convert: PROVIDER RATE (USD/1000) × USD_TO_PHP_RATE = PROVIDER RATE (PHP/1000)")
  console.log("  3. Markup: PROVIDER RATE (PHP/1000) × 1.5 = YOUR PRICE")
  console.log("  4. Profit: YOUR PRICE - PROVIDER RATE (PHP/1000)")
  console.log()
  console.log("EXAMPLE:")
  console.log("  If Provider charges $0.05 per unit:")
  console.log("  → Per 1000: $0.05 × 1000 = $50.00 per 1000")
  console.log("  → Convert to PHP: $50.00 × 50 = ₱2500.00 per 1000")
  console.log("  → Your Price: ₱2500.00 × 1.5 = ₱3750.00 per 1000 units")
  console.log("  → Your Profit: ₱3750.00 - ₱2500.00 = ₱1250.00 per 1000 units")
  console.log("=" .repeat(100))
  console.log()

  // Group services by category
  const servicesByCategory: Record<string, Service[]> = {}
  services.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = []
    }
    servicesByCategory[service.category].push(service)
  })

  // Display services by category
  Object.entries(servicesByCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryServices]) => {
      console.log(`\n📁 ${category.toUpperCase()}`)
      console.log("-".repeat(100))
      
      categoryServices
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(service => {
          const providerRateInUsdPerUnit = parseFloat(service.rate)
          const providerRateInUsdPer1000 = providerRateInUsdPerUnit * 1000
          const providerRateInPhpPer1000 = providerRateInUsdPer1000 * USD_TO_PHP_RATE
          const yourPrice = calculatePrice(providerRateInUsdPerUnit)
          const profit = yourPrice - providerRateInPhpPer1000
          
          console.log(`\n🔹 ${service.name}`)
          console.log(`   Service ID: ${service.service}`)
          console.log(`   Type: ${service.type}`)
          console.log(`   Provider Rate: $${providerRateInUsdPerUnit.toFixed(4)}/unit → $${providerRateInUsdPer1000.toFixed(2)}/1000 → ₱${providerRateInPhpPer1000.toFixed(2)}/1000`)
          console.log(`   YOUR PRICE: ₱${yourPrice.toFixed(2)} per 1000`)
          console.log(`   Profit: ₱${profit.toFixed(2)} per 1000`)
          console.log(`   Min Order: ${service.min} | Max Order: ${service.max}`)
          
          const features = []
          if (service.refill) features.push("✅ Refill Available")
          if (service.cancel) features.push("✅ Cancelable")
          if (features.length > 0) {
            console.log(`   Features: ${features.join(", ")}`)
          }
        })
      
      console.log()
    })

  // Summary statistics
  console.log("\n" + "=".repeat(100))
  console.log("SUMMARY")
  console.log("=".repeat(100))
  console.log(`Total Services: ${services.length}`)
  console.log(`Total Categories: ${Object.keys(servicesByCategory).length}`)
  
  const avgProviderRateInUsdPerUnit = services.reduce((sum, s) => sum + parseFloat(s.rate), 0) / services.length
  const avgProviderRateInUsdPer1000 = avgProviderRateInUsdPerUnit * 1000
  const avgProviderRateInPhpPer1000 = avgProviderRateInUsdPer1000 * USD_TO_PHP_RATE
  const avgYourPrice = calculatePrice(avgProviderRateInUsdPerUnit)
  
  console.log(`Average Provider Rate: $${avgProviderRateInUsdPerUnit.toFixed(4)}/unit → $${avgProviderRateInUsdPer1000.toFixed(2)}/1000 → ₱${avgProviderRateInPhpPer1000.toFixed(2)}/1000`)
  console.log(`Average Your Price: ₱${avgYourPrice.toFixed(2)} per 1000`)
  console.log(`Average Profit: ₱${(avgYourPrice - avgProviderRateInPhpPer1000).toFixed(2)} per 1000`)
  
  const lowestPriceInUsdPerUnit = Math.min(...services.map(s => parseFloat(s.rate)))
  const highestPriceInUsdPerUnit = Math.max(...services.map(s => parseFloat(s.rate)))
  const lowestPriceInUsdPer1000 = lowestPriceInUsdPerUnit * 1000
  const highestPriceInUsdPer1000 = highestPriceInUsdPerUnit * 1000
  const lowestPriceInPhpPer1000 = lowestPriceInUsdPer1000 * USD_TO_PHP_RATE
  const highestPriceInPhpPer1000 = highestPriceInUsdPer1000 * USD_TO_PHP_RATE
  
  console.log(`\nPrice Range (Provider):`)
  console.log(`  Lowest: $${lowestPriceInUsdPerUnit.toFixed(4)}/unit → ₱${lowestPriceInPhpPer1000.toFixed(2)}/1000`)
  console.log(`  Highest: $${highestPriceInUsdPerUnit.toFixed(4)}/unit → ₱${highestPriceInPhpPer1000.toFixed(2)}/1000`)
  console.log(`\nPrice Range (Your Price):`)
  console.log(`  Lowest: ₱${calculatePrice(lowestPriceInUsdPerUnit).toFixed(2)} per 1000`)
  console.log(`  Highest: ₱${calculatePrice(highestPriceInUsdPerUnit).toFixed(2)} per 1000`)
  
  console.log("\n" + "=".repeat(100))
}

main()


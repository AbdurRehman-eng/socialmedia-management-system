// Script to fetch all services and display prices per 1000

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

// Default settings from database
const DEFAULT_MARKUP = 1.5  // 50% markup
const COIN_TO_PHP_RATE = 1   // 1 coin = 1 PHP

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

function calculatePrice(providerRatePer1000: number): number {
  // Provider rate is ALREADY per 1000 units (standard for SMM panels)
  // Formula: YOUR_PRICE = PROVIDER_RATE × 1.5 (add 50% markup)
  // Example: If provider rate = ₱10.00 per 1000
  //          Your price = ₱10.00 × 1.5 = ₱15.00 per 1000
  //          Your profit = ₱5.00 per 1000
  return providerRatePer1000 * DEFAULT_MARKUP * COIN_TO_PHP_RATE
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
  console.log(`Default Markup: ${DEFAULT_MARKUP}x (${((DEFAULT_MARKUP - 1) * 100).toFixed(0)}% markup)`)
  console.log(`Coin Rate: 1 coin = ₱${COIN_TO_PHP_RATE}`)
  console.log()
  console.log("PRICING FORMULA:")
  console.log("  YOUR PRICE per 1000 = PROVIDER RATE per 1000 × 1.5")
  console.log("  YOUR PROFIT per 1000 = YOUR PRICE - PROVIDER RATE")
  console.log()
  console.log("EXAMPLE:")
  console.log("  If Provider charges ₱10.00 per 1000 units:")
  console.log("  → Your Price = ₱10.00 × 1.5 = ₱15.00 per 1000 units")
  console.log("  → Your Profit = ₱15.00 - ₱10.00 = ₱5.00 per 1000 units")
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
          const providerRate = parseFloat(service.rate)
          const yourPrice = calculatePrice(providerRate)
          const profit = yourPrice - providerRate
          
          console.log(`\n🔹 ${service.name}`)
          console.log(`   Service ID: ${service.service}`)
          console.log(`   Type: ${service.type}`)
          console.log(`   Provider Rate: ₱${providerRate.toFixed(2)} per 1000`)
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
  
  const avgProviderRate = services.reduce((sum, s) => sum + parseFloat(s.rate), 0) / services.length
  const avgYourPrice = calculatePrice(avgProviderRate)
  
  console.log(`Average Provider Rate: ₱${avgProviderRate.toFixed(2)} per 1000`)
  console.log(`Average Your Price: ₱${avgYourPrice.toFixed(2)} per 1000`)
  console.log(`Average Profit: ₱${(avgYourPrice - avgProviderRate).toFixed(2)} per 1000`)
  
  const lowestPrice = Math.min(...services.map(s => parseFloat(s.rate)))
  const highestPrice = Math.max(...services.map(s => parseFloat(s.rate)))
  
  console.log(`\nPrice Range (Provider):`)
  console.log(`  Lowest: ₱${lowestPrice.toFixed(2)} per 1000`)
  console.log(`  Highest: ₱${highestPrice.toFixed(2)} per 1000`)
  console.log(`\nPrice Range (Your Price):`)
  console.log(`  Lowest: ₱${calculatePrice(lowestPrice).toFixed(2)} per 1000`)
  console.log(`  Highest: ₱${calculatePrice(highestPrice).toFixed(2)} per 1000`)
  
  console.log("\n" + "=".repeat(100))
}

main()


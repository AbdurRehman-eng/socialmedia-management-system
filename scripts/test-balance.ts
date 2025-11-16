// Script to test provider balance API

const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "610aa8dc01d8e335e4651157209de139"

async function testBalance() {
  console.log("Testing Provider Balance API...")
  console.log("=" .repeat(80))
  console.log(`Provider URL: ${PROVIDER_URL}`)
  console.log(`Action: balance`)
  console.log("=" .repeat(80))
  console.log()

  try {
    const formData = new URLSearchParams()
    formData.append("key", API_KEY)
    formData.append("action", "balance")

    console.log("Sending request...")
    const response = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" 
      },
      body: formData.toString(),
    })

    console.log(`Response Status: ${response.status} ${response.statusText}`)
    console.log()

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`)
      const text = await response.text()
      console.error(`Response: ${text}`)
      return
    }

    const text = await response.text()
    console.log("Raw Response:")
    console.log(text)
    console.log()

    const data = JSON.parse(text)
    
    console.log("✅ Success! Parsed Response:")
    console.log("=" .repeat(80))
    console.log(`Balance: ${data.balance}`)
    console.log(`Currency: ${data.currency}`)
    console.log("=" .repeat(80))
    console.log()

    // Parse balance as number for calculations
    const balanceAmount = parseFloat(data.balance)
    
    if (isNaN(balanceAmount)) {
      console.error("⚠️  Warning: Balance is not a valid number")
    } else {
      console.log("Conversion Examples:")
      console.log("-".repeat(80))
      
      // Example USD to PHP conversions with different rates
      const rates = [45, 50, 55, 56]
      rates.forEach(rate => {
        const phpAmount = balanceAmount * rate
        console.log(`  ${data.currency} ${balanceAmount.toFixed(2)} × ${rate} = ₱${phpAmount.toFixed(2)} PHP`)
      })
      
      console.log()
      console.log("💡 Note: The USD to PHP rate can be configured by admin in the dashboard.")
      console.log("   Current default: 1 USD = 50 PHP")
    }
    
    console.log()
    console.log("=" .repeat(80))
    console.log("Test completed successfully! ✅")
    console.log("=" .repeat(80))

  } catch (error: any) {
    console.error()
    console.error("❌ Error occurred:")
    console.error("=" .repeat(80))
    console.error(error.message || error)
    if (error.stack) {
      console.error()
      console.error("Stack trace:")
      console.error(error.stack)
    }
    console.error("=" .repeat(80))
  }
}

testBalance()


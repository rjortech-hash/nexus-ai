// Test Supabase connection with current credentials
// Run with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

console.log('Testing Supabase Connection...\n')

// Show current configuration (masked)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Configuration:')
console.log('URL:', url)
console.log('Key:', key ? key.substring(0, 20) + '...' : 'MISSING')
console.log()

// Check for issues
const issues = []

if (!url) {
  issues.push('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
} else if (url.includes('/dashboard/')) {
  issues.push('❌ NEXT_PUBLIC_SUPABASE_URL is a dashboard URL, not an API URL')
  issues.push('   Should be: https://YOUR-PROJECT-REF.supabase.co')
  issues.push('   Current:   ' + url)
} else if (!url.endsWith('.supabase.co')) {
  issues.push('⚠️  NEXT_PUBLIC_SUPABASE_URL format looks unusual')
}

if (!key) {
  issues.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
} else if (!key.startsWith('sb_') && !key.startsWith('eyJ')) {
  issues.push('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY format looks unusual')
}

if (issues.length > 0) {
  console.log('Issues found:')
  issues.forEach(issue => console.log(issue))
  console.log('\nPlease fix these issues before testing the connection.')
  console.log('\nTo find your correct credentials:')
  console.log('1. Go to https://supabase.com/dashboard/org/wundwopdzamvvbqalsqu')
  console.log('2. Select your nexus-ai project')
  console.log('3. Go to Settings → API')
  console.log('4. Copy "Project URL" to NEXT_PUBLIC_SUPABASE_URL')
  console.log('5. Copy "anon public" key to NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Test connection
async function testConnection() {
  try {
    console.log('Creating Supabase client...')
    const supabase = createClient(url, key)

    console.log('Testing connection by listing tables...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.log('❌ Connection failed:', error.message)
      console.log('\nPossible reasons:')
      console.log('- Incorrect URL or API key')
      console.log('- Project is paused')
      console.log('- RLS policies preventing access (this is normal if not authenticated)')
      return
    }

    console.log('✅ Connection successful!')
    console.log('✅ Can access profiles table')

    // Test other tables
    const tables = ['conversations', 'goals', 'subscriptions']
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })

      if (tableError) {
        console.log(`⚠️  Table "${table}": ${tableError.message}`)
      } else {
        console.log(`✅ Can access ${table} table`)
      }
    }

  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
  }
}

testConnection()

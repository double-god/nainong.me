/**
 * Fix comments collection API rules
 * Run this after PocketBase is running
 */

const pb = require('pocketbase/cjs')
const client = new pb.PocketBase('http://127.0.0.1:8090')

async function fixCommentsRules() {
  try {
    // Login as admin (you'll need to provide credentials)
    const email = process.env.PB_ADMIN_EMAIL || ''
    const password = process.env.PB_ADMIN_PASSWORD || ''

    if (!email || !password) {
      console.log('❌ Please set admin credentials:')
      console.log('   PB_ADMIN_EMAIL=your_admin@email.com')
      console.log('   PB_ADMIN_PASSWORD=your_password')
      console.log('   node fix-comments-rules.js')
      return
    }

    await client.admins.authenticateWithPassword(email, password)
    console.log('✅ Logged in as admin')

    // Get the comments collection
    const collection = await client.collections.getOne('comments_collection')
    console.log('✅ Found comments collection')

    // Update API rules
    const updated = await client.collections.update('comments_collection', {
      ...collection,
      createRule: 'id != ""', // Allow anyone to create
      listRule: '', // Allow anyone to list
      viewRule: '', // Allow anyone to view
      updateRule: null, // Disallow updates
      deleteRule: null, // Disallow deletes
    })

    console.log('✅ Updated API rules for comments collection')
    console.log('   - Create rule: id != ""')
    console.log('   - List rule: (empty)')
    console.log('   - View rule: (empty)')
    console.log('   - Update rule: null')
    console.log('   - Delete rule: null')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('401')) {
      console.log('\n💡 Make sure your admin credentials are correct')
    }
  } finally {
    client.authStore.clear()
  }
}

fixCommentsRules()

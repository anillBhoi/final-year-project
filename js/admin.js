function normalizeExporterAddress(raw) {
  const trimmed = (raw || '').trim()
  if (!window.web3.utils.isAddress(trimmed)) {
    throw new Error('Invalid Ethereum address format')
  }
  return window.web3.utils.toChecksumAddress(trimmed)
}

async function ensureExporterExists(address) {
  const info = await window.contractRPC.methods.getExporterInfo(address).call()
  if (!info || String(info).trim() === '') {
    throw new Error('No exporter found for this address. Add the exporter first.')
  }
}

function setAdminButtonsBusy(busy) {
  const ids = ['ExporterBtn', 'edit', 'delete']
  if (busy) {
    $('#loader').removeClass('d-none')
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) el.setAttribute('disabled', 'true')
    })
    $('#ExporterBtn').slideUp()
    $('#edit').slideUp()
    $('#delete').slideUp()
  } else {
    $('#loader').addClass('d-none')
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el && window.isContractOwner) {
        el.removeAttribute('disabled')
        el.setAttribute('aria-disabled', 'false')
      }
    })
    $('#ExporterBtn').slideDown()
    $('#edit').slideDown()
    $('#delete').slideDown()
  }
}

function parseAdminTxError(error, action) {
  const msg = (error && error.message) || String(error)
  if (msg.includes('only owner') || msg.toLowerCase().includes('not the owner')) {
    return `Only the contract owner can ${action}.`
  }
  if (msg.includes('Internal JSON-RPC error') || error.code === -32603) {
    return 'RPC error while sending transaction. Ensure you are on Polygon Amoy, have MATIC for gas, and try again.'
  }
  if (msg.toLowerCase().includes('user denied') || msg.toLowerCase().includes('rejected')) {
    return 'Transaction rejected in wallet.'
  }
  if (msg.toLowerCase().includes('insufficient funds')) {
    return 'Insufficient MATIC for gas.'
  }
  if (msg.toLowerCase().includes('revert') || msg.toLowerCase().includes('assert')) {
    return `Transaction would fail. The exporter may not exist or inputs are invalid. (${msg})`
  }
  return msg
}

async function estimateAndSend(txBuilder, actionLabel) {
  const owner = await window.contractRPC.methods.owner().call()
  if (owner.toLowerCase() !== window.userAddress.toLowerCase()) {
    throw new Error(`Only contract owner can ${actionLabel}`)
  }

  let gas
  let gasPrice
  try {
    gas = await txBuilder.estimateGas({ from: window.userAddress })
    gas = Math.floor(gas * 1.2)
    gasPrice = await window.web3.eth.getGasPrice()
  } catch (e) {
    throw new Error(parseAdminTxError(e, actionLabel))
  }

  return txBuilder.send({ from: window.userAddress, gas, gasPrice })
}

async function getCounters() {
  try {
    // Get counts of exporters and hashes
    const exporterCount = await window.contractRPC.methods.count_Exporters().call()
    const hashCount = await window.contractRPC.methods.count_hashes().call()
    
    // Update UI with counts
    $('#num-exporters').text(exporterCount)
    $('#num-hashes').text(hashCount)
  } catch (error) {
    console.error('Error getting counters:', error)
    $('#num-exporters').text('Error')
    $('#num-hashes').text('Error')
  }
}

async function addExporter() {
  const addressRaw = document.getElementById('Exporter-address').value
  const info = (document.getElementById('info').value || '').trim()

  if (!addressRaw || !info) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide both address and information</h5>`)
    return
  }

  try {
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    const address = normalizeExporterAddress(addressRaw)
    setAdminButtonsBusy(true)
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    const tx = window.contract.methods.add_Exporter(address, info)
    await estimateAndSend(tx, 'add exporters')
    $('#note').html(`<h5 class="text-success">Exporter Added Successfully</h5>`)
    await getCounters()
    document.getElementById('Exporter-address').value = ''
    document.getElementById('info').value = ''
  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${parseAdminTxError(error, 'add exporters')}</h5>`)
  } finally {
    setAdminButtonsBusy(false)
  }
}

async function deleteExporter() {
  const addressRaw = document.getElementById('Exporter-address').value

  if (!addressRaw) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide an address to delete</h5>`)
    return
  }

  try {
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    const address = normalizeExporterAddress(addressRaw)
    await ensureExporterExists(address)

    setAdminButtonsBusy(true)
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    const tx = window.contract.methods.delete_Exporter(address)
    await estimateAndSend(tx, 'delete exporters')
    $('#note').html(`<h5 class="text-success">Exporter Removed Successfully</h5>`)
    await getCounters()
    document.getElementById('Exporter-address').value = ''
    document.getElementById('info').value = ''
  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${parseAdminTxError(error, 'delete exporters')}</h5>`)
  } finally {
    setAdminButtonsBusy(false)
  }
}

async function editExporter() {
  const addressRaw = document.getElementById('Exporter-address').value
  const newInfo = (document.getElementById('info').value || '').trim()

  if (!addressRaw || !newInfo) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide both address and new information</h5>`)
    return
  }

  try {
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    const address = normalizeExporterAddress(addressRaw)
    await ensureExporterExists(address)

    setAdminButtonsBusy(true)
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    const tx = window.contract.methods.alter_Exporter(address, newInfo)
    await estimateAndSend(tx, 'edit exporters')
    $('#note').html(`<h5 class="text-success">Exporter Information Updated</h5>`)
    await getCounters()
  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${parseAdminTxError(error, 'edit exporters')}</h5>`)
  } finally {
    setAdminButtonsBusy(false)
  }
}

async function changeOwner() {
  const newOwner = document.getElementById('new-owner-address').value

  if (!newOwner) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide new owner address</h5>`)
    return
  }

  try {
    // Validate address format
    if (!window.web3.utils.isAddress(newOwner)) {
      throw new Error('Invalid Ethereum address format')
    }

    $('#loader').removeClass('d-none')
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    // Check if caller is current owner
    const currentOwner = await window.contractRPC.methods.owner().call()
    if (currentOwner.toLowerCase() !== window.userAddress.toLowerCase()) {
      throw new Error('Only current owner can transfer ownership')
    }

    // Transfer ownership
    await window.contract.methods
      .changeOwner(newOwner)
      .send({ from: window.userAddress })
      .on('transactionHash', function(hash) {
        $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
      })
      .on('receipt', function(receipt) {
        $('#loader').addClass('d-none')
        $('#note').html(`<h5 class="text-success">Contract Ownership Transferred</h5>`)
        
        // Force logout since admin privileges are now lost
        disconnect()
      })
      .on('error', function(error) {
        throw error
      })

  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${error.message}</h5>`)
    $('#loader').addClass('d-none')
  }
}

async function isContractOwner() {
  if (typeof checkIsContractOwner === 'function') return checkIsContractOwner()
  try {
    const owner = await window.contractRPC.methods.owner().call()
    return owner.toLowerCase() === window.userAddress.toLowerCase()
  } catch (error) {
    console.error('Error checking owner:', error)
    return false
  }
}

// Function to apply admin UI based on owner status
async function applyAdminUI() {
  try {
    const isOwner = await isContractOwner()
    
    // Control buttons visibility
    const buttons = ['ExporterBtn', 'edit', 'delete']
    buttons.forEach(id => {
      const button = document.getElementById(id)
      if (button) {
        // Always show the buttons; disable when not owner
        button.style.display = 'inline-block'
        if (isOwner) {
          button.removeAttribute('disabled')
          button.removeAttribute('title')
          button.setAttribute('aria-disabled', 'false')
        } else {
          button.setAttribute('disabled', 'true')
          button.setAttribute('aria-disabled', 'true')
          button.title = 'Only contract owner can perform this action'
        }
      }
    })

    const roleEl = document.getElementById('account-role')
    if (roleEl) {
      if (isOwner) {
        roleEl.innerHTML =
          '<span class="account-role-badge account-role-owner">Contract owner</span>'
      } else {
        let roleHtml =
          '<span class="account-role-badge account-role-viewer">Viewer</span>'
        try {
          const exporterInfo = await window.contractRPC.methods
            .getExporterInfo(window.userAddress)
            .call()
          if (exporterInfo && exporterInfo !== '') {
            roleHtml =
              '<span class="account-role-badge account-role-exporter">Authorized exporter</span>'
          }
        } catch (error) {
          console.log('User is not an exporter')
        }
        roleEl.innerHTML = roleHtml
      }
    }

    // Get and display the counters
    await getCounters()
  } catch (error) {
    console.error('Error applying admin UI:', error)
    $('#note').html(`<h5 class="text-danger">Error checking permissions: ${error.message}</h5>`)
  }
}

// Initialize admin page (App.js guardAdminPageAccess runs first on window.onload)
window.addEventListener('load', async () => {
  if (!window.location.pathname.includes('admin.html')) return
  if (!window.userAddress || !(await isContractOwner())) return
  try {
    await applyAdminUI()
    await getCounters()
  } catch (error) {
    console.error('Admin initialization error:', error)
    $('#note').html(`<h5 class="text-danger">Error loading admin page: ${error.message}</h5>`)
  }
})
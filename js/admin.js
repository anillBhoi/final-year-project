async function getCounters() {
  try {
    // Get counts of exporters and hashes
    const exporterCount = await window.contractRPC.methods.count_Exporters().call()
    const hashCount = await window.contractRPC.methods.count_hashes().call()
    
    // Update UI with counts
    $('#num-exporters').html(`Number of Exporters: <span class="text-warning">${exporterCount}</span>`)
    $('#num-hashes').html(`Number of Documents: <span class="text-warning">${hashCount}</span>`)
  } catch (error) {
    console.error('Error getting counters:', error)
    $('#num-exporters').html(`Number of Exporters: <span class="text-danger">Error</span>`)
    $('#num-hashes').html(`Number of Documents: <span class="text-danger">Error</span>`)
  }
}

async function addExporter() {
  const address = document.getElementById('Exporter-address').value
  const info = document.getElementById('info').value

  if (!address || !info) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide both address and information</h5>`)
    return
  }

  try {
    // Validate network and contract connection
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    $('#loader').removeClass('d-none')
    $('#ExporterBtn').slideUp()
    $('#edit').slideUp()
    $('#delete').slideUp()
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    // Check if caller is contract owner
    const owner = await window.contractRPC.methods.owner().call()
    if (owner.toLowerCase() !== window.userAddress.toLowerCase()) {
      throw new Error('Only contract owner can add exporters')
    }

    // Add the exporter
    await window.contract.methods
      .addExporter(address, info)
      .send({ from: window.userAddress })
      .on('transactionHash', function(hash) {
        $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
      })
      .on('receipt', function(receipt) {
        $('#loader').addClass('d-none')
        $('#ExporterBtn').slideDown()
        $('#edit').slideDown()
        $('#delete').slideDown()
        $('#note').html(`<h5 class="text-success">Exporter Added Successfully</h5>`)
        getCounters() // Update counters
        
        // Clear inputs
        document.getElementById('Exporter-address').value = ''
        document.getElementById('info').value = ''
      })
      .on('error', function(error) {
        throw error
      })

  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${error.message}</h5>`)
    $('#loader').addClass('d-none')
    $('#ExporterBtn').slideDown()
    $('#edit').slideDown()
    $('#delete').slideDown()
  }
}

async function deleteExporter() {
  const address = document.getElementById('Exporter-address').value

  if (!address) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide an address to delete</h5>`)
    return
  }

  try {
    // Validate network and contract connection first
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    $('#loader').removeClass('d-none')
    $('#ExporterBtn').slideUp()
    $('#edit').slideUp() 
    $('#delete').slideUp()
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    // Check if caller is contract owner
    const owner = await window.contractRPC.methods.owner().call()
    if (owner.toLowerCase() !== window.userAddress.toLowerCase()) {
      throw new Error('Only contract owner can delete exporters')
    }

    // Delete the exporter
    await window.contract.methods
      .delete_Exporter(address)
      .send({ from: window.userAddress })
      .on('transactionHash', function(hash) {
        $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
      })
      .on('receipt', function(receipt) {
        $('#loader').addClass('d-none')
        $('#ExporterBtn').slideDown()
        $('#edit').slideDown()
        $('#delete').slideDown()
        $('#note').html(`<h5 class="text-success">Exporter Removed Successfully</h5>`)
        getCounters() // Update counters
      })
      .on('error', function(error) {
        throw error
      })

  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${error.message}</h5>`)
    $('#loader').addClass('d-none')
    $('#ExporterBtn').slideDown()
    $('#edit').slideDown()
    $('#delete').slideDown()
  }
}

async function editExporter() {
  const address = document.getElementById('Exporter-address').value
  const newInfo = document.getElementById('info').value

  if (!address || !newInfo) {
    $('#note').html(`<h5 class="text-center text-warning">Please provide both address and new information</h5>`)
    return
  }

  try {
    // Validate network and contract connection
    const isNetworkValid = await validateNetwork()
    if (!isNetworkValid) return

    $('#loader').removeClass('d-none')
    $('#ExporterBtn').slideUp()
    $('#edit').slideUp()
    $('#delete').slideUp()
    $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

    // Check if caller is contract owner
    const owner = await window.contractRPC.methods.owner().call()
    if (owner.toLowerCase() !== window.userAddress.toLowerCase()) {
      throw new Error('Only contract owner can modify exporters')
    }

    // Update the exporter info
    await window.contract.methods
      .alter_Exporter(address, newInfo)
      .send({ from: window.userAddress })
      .on('transactionHash', function(hash) {
        $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
      })
      .on('receipt', function(receipt) {
        $('#loader').addClass('d-none')
        $('#ExporterBtn').slideDown()
        $('#edit').slideDown()
        $('#delete').slideDown()
        $('#note').html(`<h5 class="text-success">Exporter Information Updated</h5>`)
      })
      .on('error', function(error) {
        throw error
      })

  } catch (error) {
    console.error(error)
    $('#note').html(`<h5 class="text-danger">${error.message}</h5>`)
    $('#loader').addClass('d-none')
    $('#ExporterBtn').slideDown()
    $('#edit').slideDown()
    $('#delete').slideDown()
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

// Function to check if current user is contract owner
async function isContractOwner() {
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
        if (isOwner) {
          button.removeAttribute('disabled')
          button.style.display = 'inline-block'
        } else {
          button.setAttribute('disabled', 'true')
          button.style.display = 'none'
        }
      }
    })

    // Update admin indicator in wallet status
    if (isOwner) {
      $('#network').after(`<span class="p-1 text-success">Role: Contract Owner</span>`)
    }

    // Check if user is an exporter by trying to get their info
    try {
      const exporterInfo = await window.contractRPC.methods.exporterInfo(window.userAddress).call()
      if (exporterInfo && exporterInfo !== '') {
        $('#network').after(`<span class="p-1 text-info">Role: Authorized Exporter</span>`)
      }
    } catch (error) {
      // If there's an error, user is not an exporter - this is expected
      console.log('User is not an exporter')
    }

    // Get and display the counters
    await getCounters()
  } catch (error) {
    console.error('Error applying admin UI:', error)
    $('#note').html(`<h5 class="text-danger">Error checking permissions: ${error.message}</h5>`)
  }
}

// Initialize admin page
window.addEventListener('load', async () => {
  if (window.location.pathname.includes('admin.html')) {
    try {
      await applyAdminUI()
      await getCounters()
    } catch (error) {
      console.error('Admin initialization error:', error)
      $('#note').html(`<h5 class="text-danger">Error loading admin page: ${error.message}</h5>`)
    }
  }
})
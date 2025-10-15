async function deleteDocument() {
    const fileInput = document.getElementById('doc-file')
    if (!fileInput.files[0]) {
        $('#note').html(`<h5 class="text-center text-warning">Please select a document first</h5>`)
        return
    }

    try {
        // Validate network and contract connection
        const isNetworkValid = await validateNetwork()
        if (!isNetworkValid) return
        if (!isNetworkValid) return

        $('#loader').removeClass('d-none')
        $('#delete-button').slideUp()
        $('#note').html(`<h5 class="text-info">Hashing document...</h5>`)

        // Hash the document
        const file = fileInput.files[0]
        const reader = new FileReader()
        
        const hash = await new Promise((resolve, reject) => {
            reader.onload = function(event) {
                try {
                    const hashedFile = web3.utils.soliditySha3(event.target.result)
                    resolve(hashedFile)
                } catch (error) {
                    reject(error)
                }
            }
            reader.onerror = reject
            reader.readAsText(file, 'UTF-8')
        })

        // Check if document exists
        const [timestamp] = await window.contractRPC.methods
            .findDocHash(hash)
            .call({ from: window.userAddress })

        if (timestamp == 0) {
            throw new Error('Document not found on blockchain')
        }

        $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

        // Delete the document hash
        await window.contract.methods
            .deleteHash(hash)
            .send({ from: window.userAddress })
            .on('transactionHash', function(txHash) {
                $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
            })
            .on('receipt', function(receipt) {
                $('#loader').addClass('d-none')
                $('#delete-button').slideDown()
                $('#note').html(`<h5 class="text-success">Document hash deleted successfully</h5>`)
                
                // Clear file input
                fileInput.value = ''
                
                // Update counters if on admin page
                if (window.location.pathname.includes('admin.html')) {
                    getCounters()
                }
            })
            .on('error', function(error) {
                throw error
            })

    } catch (error) {
        console.error(error)
        let errorMessage = error.message
        
        // Friendly error messages
        if (error.message.includes('caller is not the owner')) {
            errorMessage = 'Only document owner can delete this hash'
        } else if (error.message.includes('document not found')) {
            errorMessage = 'Document hash not found on blockchain'
        }
        
        $('#note').html(`<h5 class="text-danger">${errorMessage}</h5>`)
        $('#loader').addClass('d-none')
        $('#delete-button').slideDown()
    }
}

// Function to validate file before delete
function validateDeleteFile() {
    const fileInput = document.getElementById('doc-file')
    const deleteButton = document.getElementById('delete-button')
    
    if (fileInput && deleteButton) {
        if (fileInput.files.length > 0) {
            deleteButton.disabled = false
            $('#note').html(`<h5 class="text-info">Click delete to remove document hash</h5>`)
        } else {
            deleteButton.disabled = true
            $('#note').html(`<h5 class="text-warning">Please select a document</h5>`)
        }
    }
}

// Initialize delete page
window.addEventListener('load', () => {
    if (window.location.pathname.includes('delete.html')) {
        try {
            // Set up file input listener
            const fileInput = document.getElementById('doc-file')
            if (fileInput) {
                fileInput.addEventListener('change', validateDeleteFile)
            }
            
            // Disable delete button initially
            const deleteButton = document.getElementById('delete-button')
            if (deleteButton) {
                deleteButton.disabled = true
            }
            
            // Clear any previous messages
            $('#note').html('')
            
        } catch (error) {
            console.error('Delete page initialization error:', error)
            $('#note').html(`<h5 class="text-danger">Error initializing page: ${error.message}</h5>`)
        }
    }
})//Future Use
async function uploadDocument() {
    const fileInput = document.getElementById('doc-file')
    if (!fileInput.files[0]) {
        $('#note').html(`<h5 class="text-center text-warning">Please select a document first</h5>`)
        return
    }
    
    // Validate file size first
    if (!validateFileSize(fileInput.files[0])) {
        return
    }

    try {
        // Validate network and contract connection
        const isNetworkValid = await validateNetwork()
        if (!isNetworkValid) return

        $('#loader').removeClass('d-none')
        $('#upload-button').slideUp()
        $('#note').html(`<h5 class="text-info">Uploading to IPFS...</h5>`)

        // Upload to IPFS first
        const file = fileInput.files[0]
        const node = await Ipfs.create({ repo: 'ipfs-' + Math.random() })
        const fileBuffer = await file.arrayBuffer()
        const ipfsResult = await node.add(fileBuffer)
        const ipfsHash = ipfsResult.path

        $('#note').html(`<h5 class="text-info">Hashing document...</h5>`)

        // Hash the document
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

        // Check if document already exists
        const [timestamp] = await window.contractRPC.methods
            .findDocHash(hash)
            .call({ from: window.userAddress })

        if (timestamp != 0) {
            throw new Error('Document already exists on blockchain')
        }

        $('#note').html(`<h5 class="text-info">Please confirm the transaction...</h5>`)

        // Register the document hash
        await window.contract.methods
            .addDocHash(hash, ipfsHash)
            .send({ from: window.userAddress })
            .on('transactionHash', function(txHash) {
                $('#note').html(`<h5 class="text-info">Please wait for transaction to be mined...</h5>`)
                // Store transaction details
                window.hashedfile = hash
                window.currentTx = txHash
            })
            .on('receipt', function(receipt) {
                $('#loader').addClass('d-none')
                $('#upload-button').slideDown()
                $('#note').html(`<h5 class="text-success">Document registered successfully</h5>`)
                
                // Clear file input
                fileInput.value = ''
                
                // Print transaction details
                printUploadInfo(receipt)
                
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
        if (error.message.includes('document already exists')) {
            errorMessage = 'This document has already been registered'
        } else if (error.message.includes('caller is not an exporter')) {
            errorMessage = 'Only authorized exporters can register documents'
        }
        
        $('#note').html(`<h5 class="text-danger">${errorMessage}</h5>`)
        $('#loader').addClass('d-none')
        $('#upload-button').slideDown()
    }


// Function to validate file before upload
function validateUploadFile() {
    const fileInput = document.getElementById('doc-file')
    const uploadButton = document.getElementById('upload-button')
    
    if (!fileInput || !uploadButton) return false
    
    if (fileInput.files.length > 0) {
        if (validateFileSize(fileInput.files[0])) {
            uploadButton.disabled = false
            $('#note').html(`<h5 class="text-info">Click upload to register document</h5>`)
            return true
        }
        uploadButton.disabled = true
        return false
    }
    
    uploadButton.disabled = true
    $('#note').html(`<h5 class="text-warning">Please select a document</h5>`)
    return false
        if (fileInput.files.length > 0) {
            uploadButton.disabled = false
            $('#note').html(`<h5 class="text-info">Click upload to register document</h5>`)
        } else {
            uploadButton.disabled = true
            $('#note').html(`<h5 class="text-warning">Please select a document</h5>`)
        }
    }
}

// Function to check file size and type
function validateFileSize(file) {
    const maxSize = 10 * 1024 * 1024 // 10MB limit
    if (file.size > maxSize) {
        $('#note').html(`<h5 class="text-danger">File size must be less than 10MB</h5>`)
        return false
    }
    return true
}

// Initialize upload page
window.addEventListener('load', () => {
    if (window.location.pathname.includes('upload.html')) {
        try {
            // Set up file input listener
            const fileInput = document.getElementById('doc-file')
            if (fileInput) {
                fileInput.addEventListener('change', function() {
                    if (this.files[0]) {
                        if (validateFileSize(this.files[0])) {
                            validateUploadFile()
                        } else {
                            this.value = '' // Clear invalid file
                        }
                    }
                })
            }
            
            // Disable upload button initially
            const docFileInput = document.getElementById('doc-file')
            const uploadButton = document.getElementById('upload-button')
            
            if (docFileInput) {
                docFileInput.addEventListener('change', validateUploadFile)
            }
            
            if (uploadButton) {
                uploadButton.disabled = true
            }
            
            $('#note').html('')
            
        } catch (error) {
            console.error('Upload page initialization error:', error)
            $('#note').html(`<h5 class="text-danger">Error initializing page: ${error.message}</h5>`)
        }
    }
});
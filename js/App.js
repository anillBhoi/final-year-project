window.CONTRACT = {
  address: '0x149f99126Be306f53b9147A7B9f9b8c37039e3c3',
  network: 'https://polygon-amoy.drpc.org', // More reliable RPC endpoint
  explore: 'https://amoy.polygonscan.com/',
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_add",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_info",
          "type": "string"
        }
      ],
      "name": "add_Exporter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "_ipfs",
          "type": "string"
        }
      ],
      "name": "addDocHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_add",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_newInfo",
          "type": "string"
        }
      ],
      "name": "alter_Exporter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_exporter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "addHash",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "changeOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_add",
          "type": "address"
        }
      ],
      "name": "delete_Exporter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_hash",
          "type": "bytes32"
        }
      ],
      "name": "deleteHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "count_Exporters",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "count_hashes",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_hash",
          "type": "bytes32"
        }
      ],
      "name": "findDocHash",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_add",
          "type": "address"
        }
      ],
      "name": "getExporterInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
}
async function connect() {
  if (window.ethereum) {
    try {
      const selectedAccount = await window.ethereum
        .request({
          method: 'eth_requestAccounts',
        })
        .then((accounts) => {
          return accounts[0]
        })
        .catch(() => {
          throw Error('No account selected 👍')
        })

      window.userAddress = selectedAccount
      console.log(selectedAccount)
      window.localStorage.setItem('userAddress', window.userAddress)
      window.location.reload()
    } catch (error) {}
  } else {
    $('#upload_file_button').attr('disabled', true)
    $('#doc-file').attr('disabled', true)
    // Show The Warning for not detecting wallet
    document.querySelector('.alert').classList.remove('d-none')
  }
}

window.onload = async () => {
  $('#loader').hide()

  $('#loginButton').hide()
  $('#recent-header').hide()
  $('.loader-wraper').fadeOut('slow')
  hide_txInfo()
  $('#upload_file_button').attr('disabled', true)

  window.userAddress = window.localStorage.getItem('userAddress')

  if (window.ethereum) {
    // Use MetaMask provider for user interactions and transactions
    window.web3 = new Web3(window.ethereum)
    
    // Create a backup RPC connection for read operations only
    window.web3RPC = new Web3(window.CONTRACT.network)
    
    // Use MetaMask provider for contract (needed for transactions)
    window.contract = new window.web3.eth.Contract(
      window.CONTRACT.abi,
      window.CONTRACT.address,
    )
    
    // Create RPC contract instance for read operations only
    window.contractRPC = new window.web3RPC.eth.Contract(
      window.CONTRACT.abi,
      window.CONTRACT.address,
    )
    if (window.userAddress.length > 10) {
      // let isLocked =await window.ethereum._metamask.isUnlocked();
      //  if(!isLocked) disconnect();
      $('#logoutButton').show()
      $('#loginButton').hide()
      $('#userAddress')
        .html(`<i class="fa-solid fa-address-card mx-2 text-primary"></i>${truncateAddress(
        window.userAddress,
      )}
       <a class="text-info" href="${window.CONTRACT.explore}/address/${
        window.userAddress
      }" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-square-arrow-up-right text-warning"></i></a>  
       </a>`)

      if (window.location.pathname == '/admin.html') await getCounters()

      await getExporterInfo()
      applyRoleUI()
      await get_ChainID()
      await get_ethBalance()
      $('#Exporter-info').html(
        `<i class="fa-solid fa-building-columns mx-2 text-warning"></i>${window.info}`,
      )

      setTimeout(() => {
        listen()
      }, 0)
    } else {
      $('#logoutButton').hide()
      $('#loginButton').show()
      $('#upload_file_button').attr('disabled', true)
      $('#doc-file').attr('disabled', true)
      $('.box').addClass('d-none')
      $('.loading-tx').addClass('d-none')
    }
  } else {
    //No metamask detected
    $('#logoutButton').hide()
    $('#loginButton').hide()
    $('.box').addClass('d-none')
    $('#upload_file_button').attr('disabled', true)
    $('#doc-file').attr('disabled', true)
    document.querySelector('.alert').classList.remove('d-none')

    // alert("Please download metamask extension first.\nhttps://metamask.io/download/");
    // window.location = "https://metamask.io/download/"
  }
}

function hide_txInfo() {
  $('.transaction-status').addClass('d-none')
}

function show_txInfo() {
  $('.transaction-status').removeClass('d-none')
}
async function get_ethBalance() {
  await web3.eth.getBalance(window.userAddress, function (err, balance) {
    if (err === null) {
      $('#userBalance').html(
        "<i class='fa-brands fa-gg-circle mx-2 text-danger'></i>" +
          web3.utils.fromWei(balance).substr(0, 6) +
          '',
      )
    } else $('#userBalance').html('n/a')
  })
}

if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    connect()
    // After reconnect, UI will be reapplied. For immediate feedback try:
    setTimeout(() => { try { applyRoleUI() } catch(e){} }, 0)
  })
}

function printUploadInfo(result) {
  $('#transaction-hash').html(
    `<a target="_blank" title="View Transaction at Polygon Scan" href="${window.CONTRACT.explore}/tx/` +
      result.transactionHash +
      '"+><i class="fa fa-check-circle font-size-2 mx-1 text-white mx-1"></i></a>' +
      truncateAddress(result.transactionHash),
  )
  $('#file-hash').html(
    `<i class="fa-solid fa-hashtag mx-1"></i> ${truncateAddress(
      window.hashedfile,
    )}`,
  )
  $('#contract-address').html(
    `<i class="fa-solid fa-file-contract mx-1"></i> ${truncateAddress(
      result.to,
    )}`,
  )
  $('#time-stamps').html('<i class="fa-solid fa-clock mx-1"></i>' + getTime())
  $('#blockNumber').html(
    `<i class="fa-solid fa-link mx-1"></i>${result.blockNumber}`,
  )
  $('#blockHash').html(
    `<i class="fa-solid fa-shield mx-1"></i> ${truncateAddress(
      result.blockHash,
    )}`,
  )
  $('#to-netowrk').html(
    `<i class="fa-solid fa-chart-network"></i> ${window.chainID}`,
  )
  $('#to-netowrk').hide()
  $('#gas-used').html(
    `<i class="fa-solid fa-gas-pump mx-1"></i> ${result.gasUsed} Gwei`,
  )
  $('#loader').addClass('d-none')
  $('#upload_file_button').addClass('d-block')
  show_txInfo()
  get_ethBalance()

  $('#note').html(`<h5 class="text-info">
   Transaction Confirmed to the BlockChain 😊<i class="mx-2 text-info fa fa-check-circle" aria-hidden="true"></i>
   </h5>`)
  listen()
}

async function sendHash() {
  $('#loader').removeClass('d-none')
  $('#upload_file_button').slideUp()
  $('#note').html(
    `<h5 class="text-info">Please confirm the transaction 🙂</h5>`,
  )
  $('#upload_file_button').attr('disabled', true)
  get_ChainID()
  // Initilize Ipfs

  const file = document.getElementById('doc-file').files[0]
  node = await Ipfs.create({ repo: 'Ali-ok' + Math.random() })
  const fileReader = new FileReader()
  fileReader.readAsArrayBuffer(file)
  fileReader.onload = async (event) => {
    let result = await node.add(fileReader.result)
    window.ipfsCid = result.path
    MyCID = window.ipfsCid + '/'
    console.log('My-CID 1: ' + MyCID)
  }

  // =================================================
  if (window.hashedfile) {
    const file = document.getElementById('doc-file').files[0]
    node = await Ipfs.create({ repo: 'Ali-ok' + Math.random() })
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    fileReader.onload = async (event) => {
      let result = await node.add(fileReader.result)
      window.ipfsCid = result.path
    }
    await window.contract.methods
      .addDocHash(window.hashedfile, window.ipfsCid)
      .send({ from: window.userAddress })
      .on('transactionHash', function (_hash) {
        $('#note').html(
          `<h5 class="text-info p-1 text-center">Please wait for transaction to be mined...</h5>`,
        )
      })

      .on('receipt', function (receipt) {
        printUploadInfo(receipt)
        generateQRCode()
      })

      .on('confirmation', function (confirmationNr) {})
      .on('error', function (error) {
        console.log(error.message)
        $('#note').html(`<h5 class="text-center">${error.message} 😏</h5>`)
        $('#loader').addClass('d-none')
        $('#upload_file_button').slideDown()
      })
  }
}

async function deleteHash() {
  $('#loader').removeClass('d-none')
  $('#upload_file_button').slideUp()
  $('#note').html(
    `<h5 class="text-info">Please confirm the transaction 🙂</h5>`,
  )
  $('#upload_file_button').attr('disabled', true)
  get_ChainID()

  if (window.hashedfile) {
    await window.contract.methods
      .deleteHash(window.hashedfile)
      .send({ from: window.userAddress })
      .on('transactionHash', function (hash) {
        $('#note').html(
          `<h5 class="text-info p-1 text-center">Please wait for transaction to be mined 😴</h5>`,
        )
      })

      .on('receipt', function (receipt) {
        $('#note').html(
          `<h5 class="text-info p-1 text-center">Document Deleted 😳</h5>`,
        )

        $('#loader').addClass('d-none')
        $('#upload_file_button').slideDown()
      })

      .on('confirmation', function (confirmationNr) {
        console.log(confirmationNr)
      })
      .on('error', function (error) {
        console.log(error.message)
        $('#note').html(`<h5 class="text-center">${error.message}</h5>`)
        $('#loader').addClass('d-none')
        $('#upload_file_button').slideDown()
      })
  }
}

function getTime() {
  let d = new Date()
  a =
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1) +
    '-' +
    d.getDate() +
    ' - ' +
    d.getHours() +
    ':' +
    d.getMinutes() +
    ':' +
    d.getSeconds()
  return a
}

async function get_ChainID() {
  try {
    let a = await web3.eth.getChainId()
    console.log('Chain ID:', a)
    switch (a) {
      case 1:
        window.chainID = 'Ethereum Main Network (Mainnet)'
        break
      case 80002:
        window.chainID = 'Polygon Amoy Testnet'
        break
      case 80001:
        window.chainID = 'Polygon Test Network'
        break
      case 137:
        window.chainID = 'Polygon Mainnet'
        break
      case 3:
        window.chainID = 'Ropsten Test Network'
        break
      case 4:
        window.chainID = 'Rinkeby Test Network'
        break
      case 5:
        window.chainID = 'Goerli Test Network'
        break
      case 42:
        window.chainID = 'Kovan Test Network'
        break
      default:
        window.chainID = 'Unknown ChainID'
        break
    }
    let network = document.getElementById('network')
    if (network) {
      document.getElementById(
        'network',
      ).innerHTML = `<i class="text-info fa-solid fa-circle-nodes mx-2"></i>${window.chainID}`
    }
  } catch (error) {
    console.error('Error getting chain ID:', error);
    window.chainID = 'Network Error'
    let network = document.getElementById('network')
    if (network) {
      document.getElementById(
        'network',
      ).innerHTML = `<i class="text-danger fa-solid fa-exclamation-triangle mx-2"></i>Network Error`
    }
  }
}

// Add network validation function with retry mechanism
async function validateNetwork(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Check if we're on the correct network
      const chainId = await web3.eth.getChainId();
      if (chainId !== 80002) { // Polygon Amoy Testnet
        throw new Error('Please switch to Polygon Amoy Testnet');
      }
      
      // Test RPC connection with timeout
      const blockNumber = await Promise.race([
        web3.eth.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 10000))
      ]);
      
      console.log('Network validation successful. Latest block:', blockNumber);
      return true;
    } catch (error) {
      console.error(`Network validation attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        // Last attempt failed
        $('#note').html(`<h5 class="text-center text-danger">Network Error: ${error.message}. Please check your connection and try again.</h5>`);
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Function to test and switch RPC endpoints if needed
async function testRPCEndpoints() {
  const endpoints = [
    'https://polygon-amoy.drpc.org',
    'https://rpc-amoy.polygon.technology/',
    'https://polygon-amoy.public.blastapi.io',
    'https://polygon-amoy.gateway.tenderly.co'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing RPC endpoint: ${endpoint}`);
      const testWeb3 = new Web3(endpoint);
      const chainId = await testWeb3.eth.getChainId();
      const blockNumber = await testWeb3.eth.getBlockNumber();
      
      if (chainId === 80002) {
        // Test contract access on this endpoint
        const testContract = new testWeb3.eth.Contract(
          window.CONTRACT.abi,
          window.CONTRACT.address
        );
        
        try {
          const owner = await testContract.methods.owner().call();
          console.log(`✅ Working RPC found: ${endpoint}, Block: ${blockNumber}, Owner: ${owner}`);
          window.CONTRACT.network = endpoint;
          return endpoint;
        } catch (contractError) {
          console.log(`❌ Contract access failed on ${endpoint}: ${contractError.message}`);
          continue;
        }
      }
    } catch (error) {
      console.log(`❌ RPC failed: ${endpoint} - ${error.message}`);
    }
  }
  
  throw new Error('All RPC endpoints failed. Please check your internet connection.');
}

// Function to test contract connection with trie node error handling
async function testContractConnection() {
  try {
    console.log('Testing contract connection...');
    console.log('Contract address:', window.CONTRACT.address);
    console.log('User address:', window.userAddress);
    
    // Test contract method call using RPC (read operation)
    const owner = await window.contractRPC.methods.owner().call();
    console.log('Contract owner:', owner);
    
    // Test gas estimation using MetaMask provider (needed for transactions)
    const gasEstimate = await window.contract.methods
      .add_Exporter(window.userAddress, 'test')
      .estimateGas({ from: window.userAddress });
    console.log('Gas estimate successful:', gasEstimate);
    
    return true;
  } catch (error) {
    console.error('Contract connection test failed:', error);
    
    // Handle specific "missing trie node" error
    if (error.message.includes('missing trie node') || error.code === -32000) {
      console.log('Detected trie node error, trying to find working RPC...');
      try {
        await testRPCEndpoints();
        // Recreate RPC contract with new endpoint
        window.contractRPC = new window.web3RPC.eth.Contract(
          window.CONTRACT.abi,
          window.CONTRACT.address,
        );
        console.log('Switched to new RPC, retrying contract test...');
        
        // Retry the test
        const owner = await window.contractRPC.methods.owner().call();
        console.log('Contract owner after RPC switch:', owner);
        return true;
      } catch (retryError) {
        console.error('Failed to find working RPC:', retryError);
        return false;
      }
    }
    
    return false;
  }
}

// Function to test transaction simulation
async function testTransactionSimulation(address, info) {
  try {
    console.log('Testing transaction simulation...');
    
    // Simulate the transaction using RPC (read operation)
    const result = await window.contractRPC.methods
      .add_Exporter(address, info)
      .call({ from: window.userAddress });
    
    console.log('Transaction simulation successful:', result);
    return true;
  } catch (error) {
    console.error('Transaction simulation failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    return false;
  }
}

function get_Sha3() {
  hide_txInfo()
  $('#note').html(`<h5 class="text-warning">Hashing Your Document 😴...</h5>`)

  $('#upload_file_button').attr('disabled', false)

  console.log('file changed')

  var file = document.getElementById('doc-file').files[0]
  if (file) {
    var reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = function (evt) {
      // var SHA256 = new Hashes.SHA256();
      // = SHA256.hex(evt.target.result);
      window.hashedfile = web3.utils.soliditySha3(evt.target.result)
      console.log(`Document Hash : ${window.hashedfile}`)
      $('#note').html(
        `<h5 class="text-center text-info">Document Hashed  😎 </h5>`,
      )
    }
    reader.onerror = function (evt) {
      console.log('error reading file')
    }
  } else {
    window.hashedfile = null
  }
}

function disconnect() {
  $('#logoutButton').hide()
  $('#loginButton').show()
  window.userAddress = null
  $('.wallet-status').addClass('d-none')
  window.localStorage.setItem('userAddress', null)
  $('#upload_file_button').addClass('disabled')
}

function truncateAddress(address) {
  if (!address) {
    return
  }
  return `${address.substr(0, 7)}...${address.substr(
    address.length - 8,
    address.length,
  )}`
}

async function addExporter() {
  const address = document.getElementById('Exporter-address').value
  const info = document.getElementById('info').value

  if (info && address) {
    $('#loader').removeClass('d-none')
    $('#ExporterBtn').slideUp()
    $('#edit').slideUp()
    $('#delete').slideUp()
    $('#note').html(
      `<h5 class="text-info">Please confirm the transaction 👍...</h5>`,
    )
    $('#ExporterBtn').attr('disabled', true)
    $('#delete').attr('disabled', true)
    $('#edit').attr('disabled', true)
    get_ChainID()

    try {
      // Test RPC endpoints first
      try {
        await testRPCEndpoints();
      } catch (error) {
        $('#note').html(`<h5 class="text-center text-danger">RPC Error: ${error.message}</h5>`);
        return;
      }
      
      // Validate network connection
      const isNetworkValid = await validateNetwork();
      if (!isNetworkValid) {
        return;
      }
      
      // Test contract connection
      const isContractValid = await testContractConnection();
      if (!isContractValid) {
        $('#note').html(`<h5 class="text-center text-danger">Contract connection failed. Please check your wallet and try again.</h5>`);
        return;
      }
      
      // Test transaction simulation
      const isTransactionValid = await testTransactionSimulation(address, info);
      if (!isTransactionValid) {
        $('#note').html(`<h5 class="text-center text-danger">Transaction simulation failed. Please check your inputs and try again.</h5>`);
        return;
      }
      
      // Skip MetaMask test if we're getting rate limited - proceed with transaction
      console.log('Skipping MetaMask test to avoid rate limiting, proceeding with transaction...');

      // Validate address format
      if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Check if user has sufficient balance
      const balance = await web3.eth.getBalance(window.userAddress);
      if (balance === '0') {
        throw new Error('Insufficient balance. Please add MATIC to your wallet.');
      }

      // Estimate gas before sending transaction
      console.log('Estimating gas...');
      const gasEstimate = await window.contract.methods
        .add_Exporter(address, info)
        .estimateGas({ from: window.userAddress });
      console.log('Gas estimate:', gasEstimate);

      // Get current gas price
      const gasPrice = await window.web3.eth.getGasPrice();
      console.log('Gas price:', gasPrice);

      console.log('Sending transaction...');
      console.log('Transaction details:', {
        from: window.userAddress,
        to: window.CONTRACT.address,
        gas: Math.floor(gasEstimate * 1.2),
        gasPrice: gasPrice
      });

      // Try transaction with retry mechanism
      let transactionSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!transactionSuccess && retryCount < maxRetries) {
        try {
          console.log(`Transaction attempt ${retryCount + 1}/${maxRetries}`);
          
          await window.contract.methods
            .add_Exporter(address, info)
            .send({ 
              from: window.userAddress,
              gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
              gasPrice: gasPrice
            })
            
            .on('transactionHash', function (hash) {
              $('#note').html(
                `<h5 class="text-info p-1 text-center">Please wait for transaction to be mined 😴...</h5>`,
              )
            })

            .on('receipt', function (receipt) {
              $('#loader').addClass('d-none')
              $('#ExporterBtn').slideDown()
              $('#edit').slideDown()
              $('#delete').slideDown()
              console.log(receipt)
              $('#note').html(
                `<h5 class="text-info">Exporter Added to the Blockchain 😇</h5>`,
              )
              transactionSuccess = true;
            })

            .on('confirmation', function (confirmationNr) {})
            .on('error', function (error) {
              console.log('Transaction error details:', error);
              console.log('Error code:', error.code);
              console.log('Error message:', error.message);
              console.log('Error data:', error.data);
              
              let errorMessage = 'Transaction failed. ';
              
              if (error.message.includes('Internal JSON-RPC error')) {
                errorMessage += 'Network error. Please try again or switch networks.';
              } else if (error.message.includes('insufficient funds')) {
                errorMessage += 'Insufficient MATIC balance.';
              } else if (error.message.includes('user rejected')) {
                errorMessage += 'Transaction rejected by user.';
              } else if (error.code === -32603) {
                if (error.message.includes('missing trie node')) {
                  errorMessage += 'Blockchain state sync issue. Please refresh and try again.';
                } else {
                  errorMessage += 'Internal RPC error. Please check your network connection.';
                }
              } else if (error.code === -32000) {
                errorMessage += 'Transaction failed. Please try again.';
              } else {
                errorMessage += `${error.message} (Code: ${error.code})`;
              }
              
              $('#note').html(`<h5 class="text-center text-danger">${errorMessage}</h5>`)
              $('#loader').addClass('d-none')
              $('#ExporterBtn').slideDown()
            })
            
          transactionSuccess = true;
        } catch (error) {
          retryCount++;
          console.log(`Transaction attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            console.log('All transaction attempts failed');
            let errorMessage = 'Error: ';
            
            if (error.message.includes('Invalid Ethereum address')) {
              errorMessage += 'Please enter a valid Ethereum address.';
            } else if (error.message.includes('Insufficient balance')) {
              errorMessage += 'Please add MATIC to your wallet.';
            } else if (error.message.includes('Internal JSON-RPC error')) {
              errorMessage += 'Network connection issue. Please check your internet connection and try again.';
            } else if (error.message.includes('rate limited') || error.httpStatus === 429) {
              errorMessage += 'Rate limited. Please wait a moment and try again.';
            } else {
              errorMessage += error.message;
            }
            
            $('#note').html(`<h5 class="text-center text-danger">${errorMessage}</h5>`)
            $('#loader').addClass('d-none')
            $('#ExporterBtn').slideDown()
            $('#edit').slideDown()
            $('#delete').slideDown()
          } else {
            // Wait before retry - longer wait if rate limited
            let waitTime = 2000;
            if (error.message.includes('rate limited') || error.httpStatus === 429) {
              waitTime = 5000; // Wait 5 seconds for rate limiting
              console.log(`Rate limited detected, waiting ${waitTime/1000} seconds before retry ${retryCount + 1}...`);
            } else {
              console.log(`Waiting ${waitTime/1000} seconds before retry ${retryCount + 1}...`);
            }
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // Transaction handled in retry loop above
      return;
    } catch (error) {
      console.log('Catch error:', error);
      let errorMessage = 'Error: ';
      
      if (error.message.includes('Invalid Ethereum address')) {
        errorMessage += 'Please enter a valid Ethereum address.';
      } else if (error.message.includes('Insufficient balance')) {
        errorMessage += 'Please add MATIC to your wallet.';
      } else if (error.message.includes('Internal JSON-RPC error')) {
        errorMessage += 'Network connection issue. Please check your internet connection and try again.';
      } else {
        errorMessage += error.message;
      }
      
      $('#note').html(`<h5 class="text-center text-danger">${errorMessage}</h5>`)
      $('#loader').addClass('d-none')
      $('#ExporterBtn').slideDown()
      $('#edit').slideDown()
      $('#delete').slideDown()
    }
  } else {
    $('#note').html(
      `<h5 class="text-center text-warning">You need to provide address & inforamtion to add  </h5>`,
    )
  }
}

async function getExporterInfo() {
  await window.contractRPC.methods
    .getExporterInfo(window.userAddress)
    .call({ from: window.userAddress })

    .then((result) => {
      window.info = result
      // set a convenient boolean for role checks
      window.isExporter = !!(result && String(result).trim().length > 0)
    })
}

// Toggle UI based on whether the logged-in account is an authorised exporter
function applyRoleUI() {
  try {
    const isExporter = !!window.isExporter
    // Show/hide common exporter-only sections if present
    if (isExporter) {
      $('#upload_file_button').attr('disabled', false)
      $('#doc-file').attr('disabled', false)
      $('.box').removeClass('d-none')
      $('.loading-tx').removeClass('d-none')
      $('#recent-header').show()
      $('#cert-generator').removeClass('d-none')
    } else {
      $('#upload_file_button').attr('disabled', true)
      $('#doc-file').attr('disabled', true)
      $('.box').addClass('d-none')
      // keep loading hidden when not exporter
      $('.loading-tx').addClass('d-none')
      $('#recent-header').hide()
      $('#cert-generator').addClass('d-none')
    }
  } catch (e) {
    // no-op if elements not present on current page
  }
}

// Certificate rendering utilities
function drawCertificateToCanvas(fields) {
  const canvas = document.getElementById('cert-canvas')
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  // background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // border
  ctx.strokeStyle = '#0c5c75'
  ctx.lineWidth = 10
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  // heading
  ctx.fillStyle = '#143f4a'
  ctx.font = 'bold 42px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 120)

  // issuer
  const issuerText = fields.issuer && fields.issuer.trim().length ? fields.issuer : (window.info || 'Authorised Exporter')
  ctx.font = '20px Arial'
  ctx.fillStyle = '#555'
  ctx.fillText(`Issued by: ${issuerText}`, canvas.width / 2, 160)

  // student name
  ctx.font = 'bold 48px Arial'
  ctx.fillStyle = '#111'
  ctx.fillText(fields.student || 'Student Name', canvas.width / 2, 260)

  // course
  ctx.font = '28px Arial'
  ctx.fillStyle = '#222'
  ctx.fillText(`For: ${fields.course || 'Course/Program'}`, canvas.width / 2, 320)

  // grade and date
  ctx.font = '22px Arial'
  ctx.fillStyle = '#333'
  ctx.fillText(`Grade: ${fields.grade || 'N/A'}`, canvas.width / 2, 370)
  ctx.fillText(`Date: ${fields.date || new Date().toISOString().slice(0,10)}`, canvas.width / 2, 410)

  // footer note
  ctx.font = '16px Arial'
  ctx.fillStyle = '#777'
  ctx.fillText('Verify this certificate on-chain via the Verify page using its QR/Hash.', canvas.width / 2, 560)

  return canvas
}

function getCertificateFields() {
  const student = (document.getElementById('cert-student') || {}).value || ''
  const course = (document.getElementById('cert-course') || {}).value || ''
  const grade = (document.getElementById('cert-grade') || {}).value || ''
  const date = (document.getElementById('cert-date') || {}).value || ''
  const issuer = (document.getElementById('cert-issuer') || {}).value || ''
  return { student, course, grade, date, issuer }
}

function previewCertificate() {
  const fields = getCertificateFields()
  drawCertificateToCanvas(fields)
}

async function generateAndUploadCertificate() {
  try {
    if (!window.isExporter) {
      $('#note').html(`<h5 class="text-center text-danger">Only authorised exporters can generate certificates.</h5>`)
      return
    }

    // Render
    const fields = getCertificateFields()
    const canvas = drawCertificateToCanvas(fields)
    if (!canvas) {
      $('#note').html(`<h5 class="text-center text-danger">Canvas not available on this page.</h5>`)
      return
    }

    // Convert to PNG Blob
    const dataUrl = canvas.toDataURL('image/png')
    const pngBlob = await (await fetch(dataUrl)).blob()

    // Hash image bytes
    const arrayBuffer = await pngBlob.arrayBuffer()
    const hexString = Array.from(new Uint8Array(arrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    const certHash = web3.utils.soliditySha3('0x' + hexString)
    window.hashedfile = certHash

    // Upload to IPFS
    $('#loader').removeClass('d-none')
    $('#note').html(`<h5 class="text-info">Uploading certificate to IPFS...</h5>`)
    const node = await Ipfs.create({ repo: 'cert-' + Math.random() })
    const { path: cid } = await node.add(pngBlob)
    window.ipfsCid = cid

    // Store hash + CID on-chain
    $('#note').html(`<h5 class="text-info">Please confirm the blockchain transaction...</h5>`)
    await window.contract.methods
      .addDocHash(window.hashedfile, window.ipfsCid)
      .send({ from: window.userAddress })
      .on('transactionHash', function (_hash) {
        $('#note').html(`<h5 class="text-info p-1 text-center">Waiting for confirmation...</h5>`) })
      .on('receipt', function (receipt) {
        printUploadInfo(receipt)
        generateQRCode()
        $('#note').html(`<h5 class="text-success">Certificate published successfully.</h5>`)
      })
      .on('error', function (error) {
        $('#note').html(`<h5 class="text-danger">${error.message}</h5>`)
      })

  } catch (e) {
    console.error(e)
    $('#note').html(`<h5 class="text-danger">${e.message || 'Certificate generation failed'}</h5>`)
  } finally {
    $('#loader').addClass('d-none')
  }
}

async function listen() {
  console.log('started...')
  if (window.location.pathname != '/upload.html') return
  document.querySelector('.loading-tx').classList.remove('d-none')
  
  // Use the RPC contract for fetching events (read operation)
  await window.contractRPC.getPastEvents(
    'addHash',
    {
      filter: {
        _exporter: window.userAddress, //Only get the documents uploaded by current Exporter
      },
      fromBlock: (await window.web3RPC.eth.getBlockNumber()) - 999,
      toBlock: 'latest',
    },
    function (error, events) {
      printTransactions(events)
      console.log(events)
    },
  )
}

function printTransactions(data) {
  document.querySelector('.transactions').innerHTML = ''
  document.querySelector('.loading-tx').classList.add('d-none')
  if (!data.length) {
    $('#recent-header').hide()
    return
  }
  $('#recent-header').show()
  const main = document.querySelector('.transactions')
  for (let i = 0; i < data.length; i++) {
    const a = document.createElement('a')
    a.href = `${window.CONTRACT.explore}` + '/tx/' + data[i].transactionHash
    a.setAttribute('target', '_blank')
    a.className =
      'col-lg-3 col-md-4 col-sm-5 m-2  bg-dark text-light rounded position-relative card'
    a.style = 'overflow:hidden;'
    const image = document.createElement('object')
    image.style = 'width:100%;height: 100%;'
    image.data = `https://ipfs.io/ipfs/${data[i].returnValues[1]}`
    const num = document.createElement('h1')
    num.append(document.createTextNode(i + 1))
    a.appendChild(image)
    num.style =
      'position:absolute; left:4px; bottom: -20px;font-size:4rem; color: rgba(20, 63, 74, 0.35);'
    a.appendChild(num)
    main.prepend(a)
  }
}

// Quick test function to verify everything is working
async function quickTest() {
  try {
    console.log('🚀 Running quick test...');
    
    // Test 1: Check chain ID
    const chainId = await window.web3.eth.getChainId();
    console.log('✅ Chain ID:', chainId);
    
    // Test 2: Check contract owner (using RPC for read operations)
    const owner = await window.contractRPC.methods.owner().call();
    console.log('✅ Contract owner:', owner);
    
    // Test 3: Check balance
    const balance = await window.web3.eth.getBalance(window.userAddress);
    const balanceInMatic = window.web3.utils.fromWei(balance, 'ether');
    console.log('✅ Balance:', balanceInMatic, 'MATIC');
    
    // Test 4: Test gas estimation (using MetaMask provider)
    const gasEstimate = await window.contract.methods
      .add_Exporter(window.userAddress, 'test')
      .estimateGas({ from: window.userAddress });
    console.log('✅ Gas estimation:', gasEstimate);
    
    console.log('🎉 All tests passed! Your application is ready to use.');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Function to test MetaMask transaction capabilities with rate limiting
async function testMetaMaskTransaction() {
  try {
    console.log('Testing MetaMask transaction capabilities...');
    
    // Test 1: Check if MetaMask is connected (with delay to avoid rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log('MetaMask accounts:', accounts);
    
    // Test 2: Check network (with delay)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('MetaMask chain ID:', chainId);
    
    // Test 3: Get gas price (with delay)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const gasPrice = await window.web3.eth.getGasPrice();
    console.log('Gas price from MetaMask:', gasPrice);
    
    // Test 4: Try a simple balance check (with delay)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const balance = await window.web3.eth.getBalance(window.userAddress);
    console.log('Balance from MetaMask:', window.web3.utils.fromWei(balance, 'ether'));
    
    return true;
  } catch (error) {
    console.error('MetaMask transaction test failed:', error);
    
    // Handle rate limiting specifically
    if (error.message.includes('rate limited') || error.httpStatus === 429) {
      console.log('Rate limiting detected, waiting before retry...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      console.log('Retrying MetaMask test after rate limit delay...');
      
      try {
        // Simple retry with just essential checks
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('MetaMask chain ID (retry):', chainId);
        return true;
      } catch (retryError) {
        console.error('MetaMask retry failed:', retryError);
        return false;
      }
    }
    
    return false;
  }
}

// Simple test function that avoids rate limiting
async function simpleTest() {
  try {
    console.log('🚀 Running simple test (avoiding rate limiting)...');
    
    // Test 1: Check chain ID (minimal request)
    const chainId = await window.web3.eth.getChainId();
    console.log('✅ Chain ID:', chainId);
    
    // Test 2: Check contract owner (using RPC to avoid MetaMask rate limiting)
    const owner = await window.contractRPC.methods.owner().call();
    console.log('✅ Contract owner:', owner);
    
    // Test 3: Check balance (single request)
    const balance = await window.web3.eth.getBalance(window.userAddress);
    const balanceInMatic = window.web3.utils.fromWei(balance, 'ether');
    console.log('✅ Balance:', balanceInMatic, 'MATIC');
    
    console.log('🎉 Simple test passed! Ready for transactions.');
    return true;
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    return false;
  }
}

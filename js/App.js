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

      if (window.location.pathname == '/admin.html') {
        try {
          await getCounters()
          // Also call admin.js applyAdminUI if it exists
          if (typeof applyAdminUI === 'function') {
            await applyAdminUI()
          }
        } catch(e) {
          console.log('Admin page init error:', e)
        }
      }

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

  const file = document.getElementById('doc-file').files[0]
  if (!file) {
    window.hashedfile = null
    return
  }
  try {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function (evt) {
      try {
        const bytes = new Uint8Array(evt.target.result)
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
        window.hashedfile = web3.utils.soliditySha3('0x' + hex)
        console.log(`Document Hash : ${window.hashedfile}`)
        $('#note').html(`<h5 class="text-center text-info">Document Hashed  😎 </h5>`)
      } catch (e) {
        console.log('hash error', e)
        $('#note').html(`<h5 class="text-center text-danger">Hashing failed</h5>`)
        window.hashedfile = null
      }
    }
    reader.onerror = function () {
      console.log('error reading file')
      $('#note').html(`<h5 class="text-center text-danger">File read error</h5>`)
      window.hashedfile = null
    }
  } catch (e) {
    console.log('reader setup error', e)
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
      // Hide legacy uploader for exporters
      try { document.getElementById('legacy-uploader').style.display = 'none' } catch(e){}
      $('.box').removeClass('d-none')
      $('.loading-tx').removeClass('d-none')
      $('#recent-header').show()
      $('#cert-generator').removeClass('d-none')
      // Show certificate nav items if present
      document.querySelectorAll('.exporter-only').forEach(el => { el.classList.remove('d-none') })
    } else {
      try { document.getElementById('legacy-uploader').style.display = 'block' } catch(e){}
      $('.box').addClass('d-none')
      // keep loading hidden when not exporter
      $('.loading-tx').addClass('d-none')
      $('#recent-header').hide()
      $('#cert-generator').addClass('d-none')
      document.querySelectorAll('.exporter-only').forEach(el => { el.classList.add('d-none') })
    }
  } catch (e) {
    // no-op if elements not present on current page
  }
}

// Certificate rendering utilities
// Helpers for draggable text positions (stored per address)
function getPos(key, defX, defY) {
  try {
    const addr = (window.userAddress || '')
    const raw = window.localStorage.getItem('cert_pos_' + key + '_' + addr)
    if (!raw) return { x: defX, y: defY }
    const obj = JSON.parse(raw)
    if (typeof obj.x === 'number' && typeof obj.y === 'number') return obj
  } catch (e) {}
  return { x: defX, y: defY }
}
function setPos(key, x, y) {
  try {
    const addr = (window.userAddress || '')
    window.localStorage.setItem('cert_pos_' + key + '_' + addr, JSON.stringify({ x, y }))
  } catch (e) {}
}

function drawCertificateToCanvas(fields) {
  const canvas = document.getElementById('cert-canvas')
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  // background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Helper to render foreground text layers (always drawn after template)
  const renderForeground = (overlayDisabled) => {
  // Decorative border (hidden when overlay disabled)
  if (!overlayDisabled) {
    ctx.strokeStyle = '#0c5c75'
    ctx.lineWidth = 10
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
  }

  // Heading (hidden when overlay disabled)
    const fontFamily = (document.getElementById('cert-font')||{}).value || 'Arial'
  if (!overlayDisabled) {
    ctx.fillStyle = '#143f4a'
      ctx.font = `bold 42px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 120)
  }

  // toggle helpers
  const getAnyChecked = (ids, defVal) => {
    try {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && typeof el.checked === 'boolean') return !!el.checked
      }
    } catch (e) {}
    return defVal
  }
  const showOrg = getAnyChecked(['fld-org','toggle-org','chk-org','show-org','org-toggle','orgNameToggle'], true)
  const showHolder = getAnyChecked(['fld-holder','toggle-holder','chk-holder','show-holder','holder-toggle','holderNameToggle'], true)
  const showTagline = getAnyChecked(['fld-tag','toggle-tagline','chk-tagline','show-tagline','tagline-toggle','taglineToggle'], true)

  // issuer (draggable and without label when overlay disabled)
  if (showOrg) {
    const issuerText = fields.issuer && fields.issuer.trim().length ? fields.issuer : (window.info || 'Authorised Exporter')
      ctx.font = `20px ${fontFamily}`
    ctx.fillStyle = '#555'
      if (overlayDisabled) {
        const p = getPos('issuer', canvas.width / 2 - 180, 160)
        ctx.textAlign = 'left'
        ctx.fillText(`${issuerText}`, p.x, p.y)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(`Issued by: ${issuerText}`, canvas.width / 2, 160)
      }
  }

  // student name
  if (showHolder) {
      const color = (document.getElementById('cert-color')||{}).value || '#111'
      ctx.font = `bold 48px ${fontFamily}`
      ctx.fillStyle = color
      if (overlayDisabled) {
        const p = getPos('student', canvas.width / 2 - 180, 260)
        ctx.textAlign = 'left'
        ctx.fillText(fields.student || 'Student Name', p.x, p.y)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(fields.student || 'Student Name', canvas.width / 2, 260)
      }
  }

  // course
    ctx.font = `28px ${fontFamily}`
  ctx.fillStyle = '#222'
    if (overlayDisabled) {
      const p = getPos('course', canvas.width / 2 - 180, 320)
      ctx.textAlign = 'left'
      ctx.fillText(`For: ${fields.course || 'Course/Program'}`, p.x, p.y)
    } else {
      const alignSel = (document.getElementById('cert-align')||{}).value || 'center'
      ctx.textAlign = alignSel
      const x = alignSel==='left'? 100: alignSel==='right'? canvas.width-100: canvas.width/2
      ctx.fillText(`For: ${fields.course || 'Course/Program'}`, x, 320)
    }

  // grade and date (date draggable and without label when overlay disabled)
    ctx.font = `22px ${fontFamily}`
  ctx.fillStyle = '#333'
    if (overlayDisabled) {
      ctx.textAlign = 'left'
      const p1 = getPos('grade', canvas.width / 2 - 180, 370)
      const p2 = getPos('date', canvas.width / 2 - 180, 410)
      ctx.fillText(`Grade: ${fields.grade || 'N/A'}`, p1.x, p1.y)
      ctx.fillText(`${fields.date || new Date().toISOString().slice(0,10)}`, p2.x, p2.y)
    } else {
      ctx.textAlign = 'center'
      ctx.fillText(`Grade: ${fields.grade || 'N/A'}`, canvas.width / 2, 370)
      ctx.fillText(`Date: ${fields.date || new Date().toISOString().slice(0,10)}`, canvas.width / 2, 410)
    }

  // footer note (hidden when overlay disabled) – also controlled by checkbox
  if (!overlayDisabled && showTagline) {
      ctx.font = `16px ${fontFamily}`
    ctx.fillStyle = '#777'
    ctx.fillText('Verify this certificate on-chain via the Verify page using its QR/Hash.', canvas.width / 2, 560)
  }
  }

  // custom template background (draw first, then foreground in onload)
  try {
    const addr = (window.userAddress||'')
    const tplDataUrl = window.localStorage.getItem('cert_template_'+addr)
    const isActive = window.localStorage.getItem('cert_template_active_'+addr) === 'true'
    const disableOverlay = window.localStorage.getItem('cert_template_disableOverlay_'+addr) === 'true'
    if (tplDataUrl && isActive) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        // Always render fields (student, course, grade, date). Decorative parts controlled by overlay flag.
        renderForeground(disableOverlay)
      }
      img.src = tplDataUrl
      return canvas
    }
  } catch(e) {}

  // No active template → draw full default foreground
  renderForeground(false)

  // live update on checkbox toggles (bind once)
  try {
    const bind = (id) => { try { const el = document.getElementById(id); if (el && !el._certBound) { el.addEventListener('change', previewCertificate); el._certBound = true } } catch(e){} }
    ;['fld-org','fld-holder','fld-tag'].forEach(bind)
  } catch (e) {}

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

// IPFS helpers to reduce failures with preload endpoints and add retries
async function createIpfsClient() {
  try {
    // In-browser IPFS node; disable preload to avoid external calls that may fail
    return await Ipfs.create({
      repo: 'cert-' + Math.random(),
      preload: { enabled: false },
      start: true,
    })
  } catch (e) {
    // Fallback: try HTTP client endpoints if available in environment
    try {
      const endpoints = [
        'https://ipfs.infura.io:5001/api/v0',
        'https://dweb.link/api/v0',
        'https://node0.preload.ipfs.io/api/v0',
      ]
      for (const url of endpoints) {
        try {
          if (window.IpfsHttpClient && window.IpfsHttpClient.create) {
            const client = window.IpfsHttpClient.create({ url })
            return client
          }
        } catch (_) {}
      }
    } catch (_) {}
    throw e
  }
}

async function ipfsAddWithRetry(data, attempts = 3) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      const node = await createIpfsClient()
      const res = await node.add(data)
      const cid = res && (res.path || (res.cid && res.cid.toString && res.cid.toString()))
      if (!cid) throw new Error('Empty IPFS response')
      return cid
    } catch (e) {
      lastErr = e
      await new Promise(r => setTimeout(r, (i + 1) * 1500))
    }
  }
  throw lastErr
}

async function generateAndUploadCertificate() {
  try {
    // Debounce: disable the button immediately to prevent double clicks
    try { document.getElementById('btn-generate-upload').setAttribute('disabled','true') } catch(e){}
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

    // Convert to PNG Blob (this exact blob will be used for IPFS, hashing, and download)
    const dataUrl = canvas.toDataURL('image/png')
    const pngBlob = await (await fetch(dataUrl)).blob()

    // Hash image bytes
    const arrayBuffer = await pngBlob.arrayBuffer()
    const hexString = Array.from(new Uint8Array(arrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    const certHash = web3.utils.soliditySha3('0x' + hexString)
    window.hashedfile = certHash
    // Keep the exact blob around for a byte-identical download
    window.latestCert = { blob: pngBlob, hash: certHash }

    // Pre-flight checks to avoid generic JSON-RPC errors
    const onWrongNet = await validateNetwork()
    if (!onWrongNet) return

    // Check exporter permission (must have info)
    try {
      const info = await window.contractRPC.methods.getExporterInfo(window.userAddress).call({ from: window.userAddress })
      if (!info || String(info).trim().length === 0) {
        $('#note').html(`<h5 class="text-danger">Only authorised exporters can register documents.</h5>`)
        return
      }
    } catch (e) {}

    // Ensure this hash is not already registered
    try {
      const result = await window.contractRPC.methods.findDocHash(window.hashedfile).call({ from: window.userAddress })
      if (result && Number(result[1]) !== 0) {
        $('#note').html(`<h5 class="text-danger">This certificate is already registered on-chain.</h5>`)
        return
      }
    } catch (e) {}

    // Upload to IPFS with retry and preload disabled
    $('#loader').removeClass('d-none')
    $('#note').html(`<h5 class="text-info">Uploading certificate to IPFS...</h5>`)
    try {
      const cid = await ipfsAddWithRetry(pngBlob, 3)
      window.ipfsCid = cid
      try { window.localStorage.setItem('cert_preview_' + cid, dataUrl) } catch(e){}
    } catch (e) {
      $('#note').html(`<h5 class="text-danger">IPFS upload failed: ${e.message || e}</h5>`)
      return
    }

    // Store hash + CID on-chain
    $('#note').html(`<h5 class="text-info">Please confirm the blockchain transaction...</h5>`)

    // Gas estimate first, to surface revert reason before prompting wallet
    let gas;
    let gasPrice;
    try {
      gas = await window.contract.methods.addDocHash(window.hashedfile, window.ipfsCid).estimateGas({ from: window.userAddress })
      gas = Math.floor(gas * 1.2)
      gasPrice = await window.web3.eth.getGasPrice()
    } catch (e) {
      let friendly = 'Transaction would fail. '
      const msg = (e && e.message) || ''
      if (msg.includes('Caller not authorised') || msg.includes('not authorised')) {
        friendly += 'Your address is not an authorised exporter.'
      } else if (msg.includes('already exists')) {
        friendly += 'This certificate hash already exists.'
      } else if (msg.includes('insufficient funds')) {
        friendly += 'Insufficient balance for gas.'
      } else {
        friendly += msg
      }
      $('#note').html(`<h5 class="text-danger">${friendly}</h5>`)
      return
    }

    // Send transaction with minimal retry on rate limiting
    let attempts = 0
    const maxAttempts = 3
    while (attempts < maxAttempts) {
      try {
        await window.contract.methods
          .addDocHash(window.hashedfile, window.ipfsCid)
          .send({ from: window.userAddress, gas, gasPrice })
          .on('transactionHash', function (_hash) {
            $('#note').html(`<h5 class=\"text-info p-1 text-center\">Waiting for confirmation...</h5>`) 
            try { showToast('Transaction sent. Waiting for confirmation…','info') } catch(e){}
          })
          .on('receipt', function (receipt) {
            printUploadInfo(receipt)
            generateQRCode()
            $('#note').html(`<h5 class=\"text-success\">Certificate published successfully.</h5>`)
            try { showToast('Certificate generated and uploaded successfully.','success') } catch(e){}
            // Offer local download without page reload
            try {
              const a = document.createElement('a')
              const name = (document.getElementById('cert-student')||{}).value || 'certificate'
              const url = URL.createObjectURL(window.latestCert.blob)
              a.href = url
              a.download = `${name.replace(/\s+/g,'_')}.png`
              document.body.appendChild(a)
              a.click()
              a.remove()
              setTimeout(() => { try { URL.revokeObjectURL(url) } catch(e){} }, 1000)
            } catch(e){}
          })
        break
      } catch (error) {
        const msg = (error && error.message) || ''
        const rateLimited = msg.toLowerCase().includes('rate limited') || error.code === -32603
        if (rateLimited && attempts < maxAttempts - 1) {
          const waitMs = (attempts + 1) * 3000
          $('#note').html(`<h5 class=\"text-warning\">RPC is rate limiting. Retrying in ${waitMs/1000}s...</h5>`)
          await new Promise(r => setTimeout(r, waitMs))
          attempts++
          continue
        }
        $('#note').html(`<h5 class=\"text-danger\">${msg || 'Transaction failed'}</h5>`)
        try { showToast(msg || 'Transaction failed','danger') } catch(e){}
        break
      }
    }

  } catch (e) {
    console.error(e)
    $('#note').html(`<h5 class="text-danger">${e.message || 'Certificate generation failed'}</h5>`)
  } finally {
    $('#loader').addClass('d-none')
    // Re-enable button after the flow finishes
    try { document.getElementById('btn-generate-upload').removeAttribute('disabled') } catch(e){}
  }
}

// Lightweight toast helper (Bootstrap-like style without dependency)
function showToast(message, variant = 'info') {
  try {
    const id = 'toast-' + Date.now()
    const colors = { info: '#0dcaf0', success: '#198754', danger: '#dc3545', warning: '#ffc107' }
    const bg = colors[variant] || colors.info
    const el = document.createElement('div')
    el.id = id
    el.style = 'position:fixed;right:16px;bottom:16px;z-index:1055;max-width:360px;padding:12px 16px;border-radius:8px;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.2);background:'+bg
    el.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><span>${message}</span><button style="margin-left:auto;background:transparent;border:none;color:#fff;font-weight:bold;cursor:pointer">×</button></div>`
    el.querySelector('button').onclick = () => el.remove()
    document.body.appendChild(el)
    setTimeout(() => { try { el.remove() } catch(e){} }, 5000)
  } catch (e) {}
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
    a.style = 'overflow:hidden;height:180px;'
    // Use an <img> for broader compatibility than <object>
    const image = document.createElement('img')
    image.loading = 'lazy'
    image.decoding = 'async'
    image.alt = 'Certificate preview'
    image.style = 'width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .2s ease;'
    const cid = data[i].returnValues[1]
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://dweb.link/ipfs/',
      'https://gateway.pinata.cloud/ipfs/'
    ]
    let idx = 0
    // Prefer locally cached dataURL preview first if available (instant display)
    try {
      const cached = window.localStorage.getItem('cert_preview_' + cid)
      if (cached) {
        image.src = cached
        image.style.opacity = '1'
      } else {
        image.src = gateways[idx] + cid
      }
    } catch(e) {
      image.src = gateways[idx] + cid
    }
    image.onload = () => { image.style.opacity = '1' }
    image.onerror = () => {
      idx = (idx + 1) % gateways.length
      image.src = gateways[idx] + cid
    }
    const num = document.createElement('h1')
    num.append(document.createTextNode(i + 1))
    a.appendChild(image)
    num.style =
      'position:absolute; left:4px; bottom: -20px;font-size:4rem; color: rgba(20, 63, 74, 0.35);'
    a.appendChild(num)

    // Download button overlay (uses cached dataURL when available)
    const dl = document.createElement('a')
    dl.className = 'btn btn-sm btn-primary'
    dl.style = 'position:absolute;right:8px;bottom:8px;z-index:3'
    dl.title = 'Download certificate'
    dl.innerHTML = '<i class="fa fa-download"></i>'
    let downloadUrl = null
    try {
      downloadUrl = window.localStorage.getItem('cert_preview_' + cid)
    } catch(e) {}
    if (!downloadUrl) {
      downloadUrl = gateways[0] + cid
    }
    dl.href = downloadUrl
    dl.setAttribute('download', `certificate_${i+1}.png`)
    dl.addEventListener('click', (e) => { e.stopPropagation() })
    a.appendChild(dl)
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

// Bind custom template controls on Upload page
window.addEventListener('load', () => {
  try {
    if (!window.location.pathname.includes('upload.html')) return

    const tplFile = document.getElementById('tpl-file')
    const btnApplyTemplate = document.getElementById('btn-apply-template')
    const btnClearTemplate = document.getElementById('btn-clear-template')
    const canvas = document.getElementById('cert-canvas')

    // THEME MANAGEMENT HELPERS (classes, styles, storage)
    function removeThemeClasses(el){
      try {
        if (!el || !el.classList) return
        const toRemove = []
        el.classList.forEach(c => { if (c.indexOf('theme-') === 0) toRemove.push(c) })
        toRemove.forEach(c => el.classList.remove(c))
      } catch(e){}
    }
    function clearExistingThemeStorage(addr){
      try {
        window.localStorage.removeItem('cert_template_' + addr)
        window.localStorage.removeItem('cert_template_active_' + addr)
        window.localStorage.removeItem('cert_template_disableOverlay_' + addr)
        ;['student','course','grade','date'].forEach(k => {
          try { window.localStorage.removeItem('cert_pos_' + k + '_' + addr) } catch(e){}
        })
      } catch(e){}
    }
    function clearExistingThemeUI(){
      try {
        // Remove theme-* classes from root, body, and main containers
        removeThemeClasses(document.documentElement)
        removeThemeClasses(document.body)
        const containers = document.querySelectorAll('.data-upload, .container, .home, .work')
        containers.forEach(removeThemeClasses)
        // Clear inline theme styles
        const themed = document.querySelectorAll('[data-theme-inline="true"]')
        themed.forEach(el => { el.removeAttribute('style'); el.removeAttribute('data-theme-inline') })
      } catch(e){}
    }

    const addr = (window.userAddress || '')
    // On every fresh visit, start with default theme (do not auto-apply any saved theme)
    try { window.localStorage.removeItem('cert_template_active_' + addr) } catch(e){}

    const storeTemplate = async (file) => {
      if (!file) return
      const arrayBuf = await file.arrayBuffer()
      const blob = new Blob([new Uint8Array(arrayBuf)], { type: file.type })
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
      // Hard-replace any previous theme (classes, styles, storage)
      clearExistingThemeUI()
      clearExistingThemeStorage(addr)
      window.localStorage.setItem('cert_template_' + addr, dataUrl)
      // When a template is explicitly applied, disable default overlay so only the theme image shows
      window.localStorage.setItem('cert_template_disableOverlay_' + addr, 'true')
      // Activate this template for rendering
      window.localStorage.setItem('cert_template_active_' + addr, 'true')
      // Reset any custom positions if switching themes
      ;['student','course','grade','date'].forEach(k => {
        try { window.localStorage.removeItem('cert_pos_' + k + '_' + addr) } catch(e){}
      })
      // Apply only new theme classes (optional convention)
      document.body.classList.add('theme-active','theme-custom')
      // Example of applying inline theme color variables if needed
      try {
        document.documentElement.style.setProperty('--theme-accent', '#143f4a')
        document.documentElement.dataset.themeInline = 'true'
      } catch(e){}
      previewCertificate()
    }

    if (btnApplyTemplate) {
      btnApplyTemplate.addEventListener('click', async () => {
        if (tplFile && tplFile.files && tplFile.files[0]) {
          await storeTemplate(tplFile.files[0])
        }
      })
    }
    if (btnClearTemplate) {
      btnClearTemplate.addEventListener('click', () => {
        const addr = (window.userAddress || '')
        clearExistingThemeUI()
        clearExistingThemeStorage(addr)
        previewCertificate()
      })
    }

    // Always show default on load
    setTimeout(() => { try { previewCertificate() } catch(e){} }, 0)

    // Enable drag of fields when a template is active
    try {
      let draggingKey = null
      let offsetX = 0, offsetY = 0

      function getActiveFlag() {
        const addr = (window.userAddress || '')
        return window.localStorage.getItem('cert_template_active_' + addr) === 'true'
      }

      function hitTest(mx, my) {
        // Build objects with current positions and measure widths
        const addr = (window.userAddress || '')
        const isActive = window.localStorage.getItem('cert_template_active_' + addr) === 'true'
        if (!isActive) return null
        const ctx = canvas.getContext('2d')
        const fontFamily = (document.getElementById('cert-font')||{}).value || 'Arial'
        const color = (document.getElementById('cert-color')||{}).value || '#111'
        const fields = getCertificateFields()
        const objs = []
        // student
        ctx.font = `bold 48px ${fontFamily}`
        const pS = getPos('student', canvas.width/2 - 180, 260)
        objs.push({ key:'student', x:pS.x, y:pS.y, w: ctx.measureText(fields.student||'Student Name').width, h: 54 })
        // course
        ctx.font = `28px ${fontFamily}`
        const pC = getPos('course', canvas.width/2 - 180, 320)
        objs.push({ key:'course', x:pC.x, y:pC.y, w: ctx.measureText('For: ' + (fields.course||'Course/Program')).width, h: 32 })
        // issuer
        ctx.font = `20px ${fontFamily}`
        const issuerText = fields.issuer && fields.issuer.trim().length ? fields.issuer : (window.info || 'Authorised Exporter')
        const pI = getPos('issuer', canvas.width/2 - 180, 160)
        objs.push({ key:'issuer', x:pI.x, y:pI.y, w: ctx.measureText(issuerText).width, h: 26 })
        // grade
        ctx.font = `22px ${fontFamily}`
        const pG = getPos('grade', canvas.width/2 - 180, 370)
        objs.push({ key:'grade', x:pG.x, y:pG.y, w: ctx.measureText('Grade: ' + (fields.grade||'N/A')).width, h: 26 })
        // date
        const pD = getPos('date', canvas.width/2 - 180, 410)
        objs.push({ key:'date', x:pD.x, y:pD.y, w: ctx.measureText((fields.date||new Date().toISOString().slice(0,10))).width, h: 26 })

        // simple bbox around baseline
        for (let i=objs.length-1; i>=0; i--) {
          const o = objs[i]
          const left = o.x
          const top = o.y - o.h + 6
          if (mx >= left && mx <= left + o.w && my >= top && my <= top + o.h) {
            return { key: o.key, x: o.x, y: o.y }
          }
        }
        return null
      }

      function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect()
        return {
          x: (evt.clientX - rect.left) * (canvas.width / rect.width),
          y: (evt.clientY - rect.top) * (canvas.height / rect.height)
        }
      }

      canvas.addEventListener('mousedown', (e) => {
        if (!getActiveFlag()) return
        const m = getMousePos(e)
        const hit = hitTest(m.x, m.y)
        if (hit) {
          draggingKey = hit.key
          offsetX = m.x - hit.x
          offsetY = m.y - hit.y
        }
      })

      canvas.addEventListener('mousemove', (e) => {
        if (!getActiveFlag()) return
        if (!draggingKey) return
        const m = getMousePos(e)
        const nx = m.x - offsetX
        const ny = m.y - offsetY
        setPos(draggingKey, nx, ny)
        previewCertificate()
      })

      window.addEventListener('mouseup', () => {
        draggingKey = null
      })
    } catch (e) {
      console.log('Drag init error:', e)
    }

    // Download button
    const dlBtn = document.getElementById('download-cert')
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const canvas = document.getElementById('cert-canvas')
        if (!canvas) return
        // Ensure latest fields are rendered
        previewCertificate()
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = url
        const name = (document.getElementById('cert-student')||{}).value || 'certificate'
        a.download = `${name.replace(/\s+/g,'_')}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
    }
  } catch (e) {
    console.log('Template controls init error:', e)
  }
})

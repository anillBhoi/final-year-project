window.CONTRACT = {
  address: '0x149f99126Be306f53b9147A7B9f9b8c37039e3c3',
  network: 'https://polygon-amoy.drpc.org',
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
const web3 = new Web3(window.CONTRACT.network)
const contract = new web3.eth.Contract(
  window.CONTRACT.abi,
  window.CONTRACT.address,
)

// Images to show for verification states
const SUCCESS_IMAGE = './files/securefiles.svg'
const FAILURE_IMAGE = './files/notvalid.svg'

window.onload = async () => {
  $('#loader').hide()
  $('.loader-wraper').fadeOut('slow')
  checkURL()
  $('#upload_file_button').attr('disabled', true)
}

async function verify_Hash() {
  $('#loader').show()
  if (!window.hashedfile) return
  try {
    const result = await contract.methods
      .findDocHash(window.hashedfile)
      .call({ from: window.userAddress })
    console.log(result)
    $('.transaction-status').removeClass('d-none')
    window.newHash = result
    if ((result[0] != 0) & (result[1] != 0)) {
      print_info(result, true)
    } else {
      print_info(result, false)
    }
  } catch (e) {
    console.log('verify error', e)
    $('#loader').hide()
    $('#doc-status').html(`<h3 class="text-danger">Network error: ${
      (e && e.message) || 'Failed to query blockchain'
    }</h3>`) 
    $('.transaction-status').removeClass('d-none')
  }
}

function checkURL() {
  let url_string = window.location.href
  let url = new URL(url_string)
  window.hashedfile = url.searchParams.get('hash')
  if (!window.hashedfile) return

  verify_Hash()
}

async function get_Sha3() {
  $('#note').html(`<h5 class="text-warning">Hashing Your Document 😴...</h5>`)
  $('#upload_file_button').attr('disabled', false)
  const file = document.getElementById('doc-file').files[0]
  if (!file) {
    window.hashedfile = null
    return false
  }

  try {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = async function (evt) {
      try {
        const buffer = new Uint8Array(evt.target.result)
        const hex = Array.from(buffer)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        window.hashedfile = await web3.utils.soliditySha3('0x' + hex)
        console.log(`Document Hash (bytes): ${window.hashedfile}`)
        $('#note').html(
          `<h5 class="text-center text-info">Document Hashed  😎 </h5>`,
        )
      } catch (e) {
        console.log('hashing error', e)
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
    return false
  }
}

function print_info(result, is_verified) {
  //Default Image for not Verified Docunets
  document.getElementById('student-document').src = FAILURE_IMAGE
  $('#loader').hide()
  // when document not verfied
  if (!is_verified) {
    // document.getElementById('download-document').classList.add('d-none')
    $('#download-document').hide()
    $('#doc-status').html(`<h3 class="text-danger">
        Certificate not Verified 😕
         <i class="text-danger  fa fa-times-circle" aria-hidden="true"></i>
        </h3>`)
    $('#file-hash').html(
      `<span class="text-info"><i class="fa-solid fa-hashtag"></i></span> ${truncateAddress(
        window.hashedfile,
      )}`,
    )
    $('#college-name').hide()
    $('#contract-address').hide()
    $('#time-stamps').hide()
    $('#blockNumber').hide()
    $('.transaction-status').show()
  } else {
    $('#download-document').show()
    // when document verfied
    $('#college-name').show()
    $('#contract-address').show()
    $('#time-stamps').show()
    $('#blockNumber').show()

    var t = new Date(1970, 0, 1)
    t.setSeconds(result[1])
    console.log(result[1])
    t.setHours(t.getHours() + 3)
    // hide loader
    $('#loader').hide()
    $('#doc-status').html(`<h3 class="text-info">
         Certificate Verified Successfully 😊
         <i class="text-info fa fa-check-circle" aria-hidden="true"></i>
        </h3>`)
    $('#file-hash').html(
      `<span class="text-info"><i class="fa-solid fa-hashtag"></i></span> ${truncateAddress(
        window.hashedfile,
      )}`,
    )
    $('#college-name').html(
      `<span class="text-info"><i class="fa-solid fa-graduation-cap"></i></span> ${result[2]}`,
    )
    $('#contract-address').html(
      `<span class="text-info"><i class="fa-solid fa-file-contract"></i> </span>${truncateAddress(
        window.CONTRACT.address,
      )}`,
    )
    $('#time-stamps').html(
      `<span class="text-info"><i class="fa-solid fa-clock"></i> </span>${t}`,
    )
    $('#blockNumber').html(
      `<span class="text-info"><i class="fa-solid fa-cube"></i></span> ${result[0]}`,
    )
    // Show a success illustration; link button opens actual certificate on IPFS
    document.getElementById('student-document').src = SUCCESS_IMAGE
    document.getElementById('download-document').href = 'https://ipfs.io/ipfs/' + result[3]
    $('.transaction-status').show()
  }
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

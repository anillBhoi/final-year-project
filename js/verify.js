window.CONTRACT = {
  address: '0xB01753970CB6A7C7c5b4A5ECFF875DC17568aa7B',
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

function certEmoji(emoji, animation) {
  if (typeof window.certEmoji === 'function') {
    return window.certEmoji(emoji, animation)
  }
  const anim = animation || 'emoji-bounce'
  return `<span class="${anim}" style="font-size: 1.35em; vertical-align: middle;" aria-hidden="true">${emoji}</span>`
}

window.addEventListener('load', async () => {
  $('#loader').addClass('d-none')
  $('.loader-wraper').fadeOut('slow')
  window.hashedfiles = []
  await checkURL()
  $('#upload_file_button').attr('disabled', true)
  renderQueuedDocuments()
  hideVerifyPanel()
})

async function verifyDocuments() {
  if (!Array.isArray(window.hashedfiles)) {
    window.hashedfiles = []
  }

  // If user selected files but queue is empty (for any reason), build queue directly.
  if (!window.hashedfiles.length) {
    await buildQueueFromInputFiles()
  }

  const fileHashes = window.hashedfiles.length
    ? window.hashedfiles
    : window.hashedfile
      ? [{ name: 'URL hash', hash: window.hashedfile }]
      : []

  if (!fileHashes.length) {
    $('#note').html(`<h5 class="text-center text-danger">Please choose at least one certificate</h5>`)
    return
  }

  $('#loader').removeClass('d-none')
  const rows = []
  for (const item of fileHashes) {
    try {
      const result = await contract.methods.findDocHash(item.hash).call()
      const isVerified = result[0] != 0 && result[1] != 0
      rows.push({
        name: item.name,
        hash: item.hash,
        isVerified: isVerified,
        chainResult: result,
        issuer: isVerified ? result[2] : '-',
        blockNumber: isVerified ? result[0] : '-',
        timestamp: isVerified ? formatTimestamp(result[1]) : '-',
        ipfsHash: isVerified ? result[3] : '',
      })
    } catch (e) {
      rows.push({
        name: item.name,
        hash: item.hash,
        isVerified: false,
        chainResult: null,
        issuer: 'Network error',
        blockNumber: '-',
        timestamp: '-',
        ipfsHash: '',
      })
      console.log('verify error', e)
    }
  }
  renderVerificationResults(rows)
  $('#loader').addClass('d-none')
}

async function checkURL() {
  let url_string = window.location.href
  let url = new URL(url_string)
  window.hashedfile = url.searchParams.get('hash')
  const autoVerify = url.searchParams.get('autoVerify')
  if (!window.hashedfile) return
  window.hashedfiles = [{ name: 'URL hash', hash: window.hashedfile }]
  renderQueuedDocuments()
  if (autoVerify === '1' || autoVerify === 'true' || autoVerify === 'yes') {
    $('#note').html(
      '<h5 class="text-info text-center">QR scan detected. Auto-verifying certificate...</h5>',
    )
    await verifyDocuments()
    const resultsEl = document.getElementById('verification-results')
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
  $('#note').html(
    '<h5 class="text-info text-center">URL hash added to queue. Click Verify to check it.</h5>',
  )
}

async function getVerifySha3() {
  const files = Array.from(document.getElementById('doc-file').files || [])
  if (!files.length) {
    return false
  }

  $('#note').html(
    `<h5 class="text-warning">Adding ${files.length} certificate(s) to queue ${certEmoji('😴', 'emoji-pulse')}...</h5>`,
  )
  $('#upload_file_button').attr('disabled', true)

  try {
    const newlyHashed = []
    for (const file of files) {
      const hash = await hashFile(file)
      newlyHashed.push({ name: file.name, hash: hash })
    }
    window.hashedfiles = [...(window.hashedfiles || []), ...newlyHashed]
    window.hashedfile = window.hashedfiles[0] ? window.hashedfiles[0].hash : null

    renderQueuedDocuments()
    document.getElementById('doc-file').value = ''
    $('#upload_file_button').attr('disabled', false)
    $('#note').html(
      `<h5 class="text-center text-info">Added ${newlyHashed.length} certificate(s). Total in queue: ${window.hashedfiles.length} ${certEmoji('😎', 'emoji-bounce')}</h5>`,
    )
  } catch (e) {
    console.log('hashing error', e)
    $('#upload_file_button').attr('disabled', !(window.hashedfiles || []).length)
    $('#note').html(`<h5 class="text-center text-danger">Hashing failed for selected file(s). Existing queued documents are still available.</h5>`)
    return false
  }
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = async function (evt) {
      try {
        const buffer = new Uint8Array(evt.target.result)
        const hex = Array.from(buffer)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        resolve(await web3.utils.soliditySha3('0x' + hex))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = function () {
      reject(new Error('File read error'))
    }
  })
}

async function buildQueueFromInputFiles() {
  const files = Array.from(document.getElementById('doc-file').files || [])
  if (!files.length) return

  const hashedFromInput = []
  for (const file of files) {
    const hash = await hashFile(file)
    hashedFromInput.push({ name: file.name, hash: hash })
  }

  window.hashedfiles = hashedFromInput
  window.hashedfile = hashedFromInput[0] ? hashedFromInput[0].hash : null
  renderQueuedDocuments()
}

function renderVerificationResults(rows) {
  const totalCount = rows.length
  const verifiedCount = rows.filter((row) => row.isVerified).length
  const notVerifiedCount = totalCount - verifiedCount

  let bannerEmoji
  let bannerText
  let bannerClass = 'alert-info'

  if (totalCount === 0) {
    bannerEmoji = certEmoji('😴', 'emoji-pulse')
    bannerText = 'No certificates to verify.'
    bannerClass = 'alert-warning'
  } else if (verifiedCount === totalCount) {
    bannerEmoji = certEmoji('😎', 'emoji-bounce')
    bannerText =
      totalCount === 1
        ? 'Certificate verified on-chain!'
        : `All ${totalCount} certificates verified on-chain!`
    bannerClass = 'alert-success'
  } else if (verifiedCount === 0) {
    bannerEmoji = certEmoji('😢', 'emoji-shake')
    bannerText =
      totalCount === 1
        ? 'Certificate not found or not verified.'
        : `None of the ${totalCount} certificates were verified.`
    bannerClass = 'alert-danger'
  } else {
    bannerEmoji = certEmoji('😕', 'emoji-pulse')
    bannerText = `${verifiedCount} verified, ${notVerifiedCount} not verified.`
    bannerClass = 'alert-warning'
  }

  $('#verification-summary').html(
    `<div class="verification-emoji-banner text-center mb-2">${bannerEmoji} ${bannerText}</div>
     <p class="mb-0 text-center"><strong>Total:</strong> ${totalCount} &nbsp;|&nbsp; <strong>Verified:</strong> ${verifiedCount} &nbsp;|&nbsp; <strong>Not Verified:</strong> ${notVerifiedCount}</p>`,
  )
  $('#verification-summary').removeClass('alert-secondary alert-success alert-danger alert-warning alert-info').addClass(bannerClass)

  $('#note').html(
    `<h5 class="text-center ${verifiedCount === totalCount && totalCount > 0 ? 'text-info' : verifiedCount === 0 ? 'text-danger' : 'text-warning'}">${bannerEmoji} ${bannerText}</h5>`,
  )

  const rowsHtml = rows
    .map((row) => {
      const statusBadge = row.isVerified
        ? `<span class="badge bg-success">Verified ${certEmoji('😎', 'emoji-bounce')}</span>`
        : `<span class="badge bg-danger">Not Verified ${certEmoji('😢', 'emoji-shake')}</span>`
      const certificateUrls = buildIpfsGatewayUrls(row.ipfsHash)
      const fileLink =
        row.isVerified && certificateUrls.primary
          ? `<a href="${certificateUrls.primary}" target="_blank" rel="noopener noreferrer">View Certificate</a>
             <span class="text-muted"> | </span>
             <a href="${certificateUrls.backup}" target="_blank" rel="noopener noreferrer">Try Backup</a>`
          : '-'
      return `
      <tr>
        <td>${row.name}</td>
        <td>${statusBadge}</td>
        <td>${truncateAddress(row.hash)}</td>
        <td>${row.issuer}</td>
        <td>${row.blockNumber}</td>
        <td>${row.timestamp}</td>
        <td>${fileLink}</td>
      </tr>`
    })
    .join('')

  $('#verification-results-body').html(rowsHtml)
  $('#verification-results').removeClass('d-none')

  if (rows.length === 1) {
    window.hashedfile = rows[0].hash
    print_info(rows[0].chainResult || [], rows[0].isVerified)
    showVerifyPanel()
    document.querySelector('.transaction-status')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  } else {
    hideVerifyPanel()
  }
}

function renderQueuedDocuments() {
  const queuedFiles = window.hashedfiles || []
  if (!queuedFiles.length) {
    $('#queued-documents').addClass('d-none')
    $('#queued-documents-list').html('')
    $('#queued-summary').html('')
    $('#upload_file_button').attr('disabled', true)
    return
  }

  const listHtml = queuedFiles
    .map((item) => `<li>${item.name} <small class="text-muted">(${truncateAddress(item.hash)})</small></li>`)
    .join('')

  $('#queued-documents-list').html(listHtml)
  $('#queued-summary').html(`<strong>Total uploaded in queue:</strong> ${queuedFiles.length}`)
  $('#queued-documents').removeClass('d-none')
  $('#upload_file_button').attr('disabled', false)
}

function clearQueuedDocuments() {
  window.hashedfiles = []
  window.hashedfile = null
  $('#verification-results').addClass('d-none')
  $('#verification-results-body').html('')
  $('#verification-summary').html('')
  hideVerifyPanel()
  $('#note').html('<h5 class="text-center text-warning">Queue cleared</h5>')
  document.getElementById('doc-file').value = ''
  renderQueuedDocuments()
}

function showVerifyPanel() {
  document.querySelector('.transaction-status')?.classList.remove('d-none')
}

function hideVerifyPanel() {
  document.querySelector('.transaction-status')?.classList.add('d-none')
}

function setVerifyDetail(id, value) {
  const el = document.getElementById(id)
  if (!el) return
  const span = el.querySelector('span')
  if (span) span.textContent = value
  else el.textContent = value
  el.classList.remove('d-none')
}

function hideVerifyDetail(id) {
  document.getElementById(id)?.classList.add('d-none')
}

function formatTimestamp(unixTimestamp) {
  const date = new Date(1970, 0, 1)
  date.setSeconds(unixTimestamp)
  date.setHours(date.getHours() + 3)
  return date.toString()
}

function buildIpfsGatewayUrls(ipfsValue) {
  if (!ipfsValue) return ''
  const cleaned = String(ipfsValue).trim()
  if (!cleaned) return { primary: '', backup: '' }

  if (/^https?:\/\//i.test(cleaned)) {
    return {
      primary: cleaned,
      backup: cleaned,
    }
  }

  let path = cleaned
  if (/^ipfs:\/\//i.test(cleaned)) {
    path = cleaned
      .replace(/^ipfs:\/\//i, '')
      .replace(/^ipfs\//i, '')
      .replace(/^\/+/, '')
  }

  if (/^\/?ipfs\//i.test(path)) {
    path = path.replace(/^\/?ipfs\//i, '')
  }

  path = path.replace(/^\/+/, '')
  return {
    // Primary gateway is often faster for browser loads.
    primary: `https://${path}.ipfs.dweb.link`,
    // Backup gateway for 504/timeout cases.
    backup: `https://ipfs.io/ipfs/${path}`,
  }
}

function print_info(result, is_verified) {
  const statusBadge = document.getElementById('verify-status-badge')
  const docStatus = document.getElementById('doc-status')
  const previewImg = document.getElementById('student-document')
  const downloadLink = document.getElementById('download-document')

  $('#loader').addClass('d-none')
  previewImg.src = is_verified ? SUCCESS_IMAGE : FAILURE_IMAGE

  if (!is_verified) {
    if (statusBadge) {
      statusBadge.className = 'verify-status-badge is-failed'
      statusBadge.innerHTML =
        '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Not verified'
    }
    if (docStatus) {
      docStatus.innerHTML = `Certificate not verified ${certEmoji('😢', 'emoji-shake')}`
    }
    setVerifyDetail('file-hash', truncateAddress(window.hashedfile))
    hideVerifyDetail('college-name')
    hideVerifyDetail('contract-address')
    hideVerifyDetail('time-stamps')
    hideVerifyDetail('blockNumber')
    downloadLink?.classList.add('d-none')
    showVerifyPanel()
    return
  }

  if (statusBadge) {
    statusBadge.className = 'verify-status-badge is-verified'
    statusBadge.innerHTML =
      '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Verified on-chain'
  }
  if (docStatus) {
    docStatus.innerHTML = `Certificate verified successfully ${certEmoji('😎', 'emoji-bounce')}`
  }

  const t = new Date(1970, 0, 1)
  t.setSeconds(result[1])
  t.setHours(t.getHours() + 3)

  setVerifyDetail('file-hash', truncateAddress(window.hashedfile))
  setVerifyDetail('college-name', result[2])
  setVerifyDetail('contract-address', truncateAddress(window.CONTRACT.address))
  setVerifyDetail('time-stamps', t.toString())
  setVerifyDetail('blockNumber', String(result[0]))

  const linkSet = buildIpfsGatewayUrls(result[3])
  if (downloadLink && linkSet.primary) {
    downloadLink.href = linkSet.primary
    downloadLink.classList.remove('d-none')
  } else {
    downloadLink?.classList.add('d-none')
  }

  showVerifyPanel()
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

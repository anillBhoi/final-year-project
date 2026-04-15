// Certificate Designer powered by Fabric.js
// Requires window.web3/window.contract/window.contractRPC/window.isExporter from App.js

(function () {
  let canvas

  function ensureExporterUI() {
    const guard = document.getElementById('designer-guard')
    const designer = document.getElementById('designer')
    if (window.isExporter) {
      if (guard) guard.classList.add('d-none')
      if (designer) designer.classList.remove('d-none')
    } else {
      if (guard) guard.classList.remove('d-none')
      if (designer) designer.classList.add('d-none')
    }
  }

  function initCanvas() {
    canvas = new fabric.Canvas('fabric-canvas', { preserveObjectStacking: true })
    // Default background
    const bg = new fabric.Rect({ left: 0, top: 0, width: canvas.width, height: canvas.height, fill: '#ffffff', selectable: false, evented: false })
    canvas.add(bg)
    canvas.sendToBack(bg)
  }

  function addText(text, options) {
    const t = new fabric.Textbox(text || 'Double-click to edit', Object.assign({
      left: 100,
      top: 120,
      fontFamily: 'Arial',
      fontSize: 28,
      fill: '#111',
      width: 600,
      editable: true,
    }, options || {}))
    canvas.add(t)
    canvas.setActiveObject(t)
  }

  function applyStyle(style) {
    const obj = canvas.getActiveObject()
    if (!obj || obj.type !== 'textbox') return
    if (style === 'bold') obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold')
    if (style === 'italic') obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic')
    if (style === 'left' || style === 'center' || style === 'right') obj.set('textAlign', style)
    canvas.requestRenderAll()
  }

  function setColor(color) {
    const obj = canvas.getActiveObject()
    if (!obj || obj.type !== 'textbox') return
    obj.set('fill', color)
    canvas.requestRenderAll()
  }

  function composeDefaultTemplate() {
    canvas.clear()
    // Background
    const bg = new fabric.Rect({ left: 0, top: 0, width: canvas.width, height: canvas.height, fill: '#ffffff', selectable: false })
    const border = new fabric.Rect({ left: 20, top: 20, width: canvas.width - 40, height: canvas.height - 40, stroke: '#0c5c75', strokeWidth: 10, fill: 'transparent', selectable: false })
    const heading = new fabric.Text('CERTIFICATE OF ACHIEVEMENT', { left: canvas.width / 2, top: 100, fontFamily: 'Arial', fontSize: 46, fontWeight: 'bold', fill: '#143f4a', originX: 'center' })

    const issuer = (document.getElementById('field-issuer') || {}).value || (window.info || 'Authorised Exporter')
    const issuerText = new fabric.Text(`Issued by: ${issuer}`, { left: canvas.width / 2, top: 160, fontFamily: 'Arial', fontSize: 20, fill: '#555', originX: 'center' })

    const student = (document.getElementById('field-student') || {}).value || 'Student Name'
    const course = (document.getElementById('field-course') || {}).value || 'Course/Program'
    const grade = (document.getElementById('field-grade') || {}).value || 'N/A'
    const date = (document.getElementById('field-date') || {}).value || new Date().toISOString().slice(0, 10)

    const studentText = new fabric.Text(student, { left: canvas.width / 2, top: 260, fontFamily: 'Arial', fontSize: 48, fontWeight: 'bold', fill: '#111', originX: 'center' })
    const courseText = new fabric.Text(`For: ${course}`, { left: canvas.width / 2, top: 320, fontFamily: 'Arial', fontSize: 28, fill: '#222', originX: 'center' })
    const gradeText = new fabric.Text(`Grade: ${grade}`, { left: canvas.width / 2, top: 380, fontFamily: 'Arial', fontSize: 22, fill: '#333', originX: 'center' })
    const dateText = new fabric.Text(`Date: ${date}`, { left: canvas.width / 2, top: 420, fontFamily: 'Arial', fontSize: 22, fill: '#333', originX: 'center' })
    const footer = new fabric.Text('Verify this certificate via the Verify page using its hash/QR.', { left: canvas.width / 2, top: 560, fontFamily: 'Arial', fontSize: 16, fill: '#777', originX: 'center' })

    canvas.add(bg, border, heading, issuerText, studentText, courseText, gradeText, dateText, footer)
    canvas.requestRenderAll()
  }

  async function hashBytes(arrayBuffer) {
    const hex = Array.from(new Uint8Array(arrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    return window.web3.utils.soliditySha3('0x' + hex)
  }

  async function generateAndUpload() {
    try {
      if (!window.isExporter) {
        $('#note').html(`<h5 class="text-center text-danger">Only authorised exporters can generate certificates.</h5>`)
        return
      }
      document.getElementById('loader').classList.remove('d-none')
      $('#note').html(`<h5 class="text-info">Rendering certificate...</h5>`)

      const dataUrl = canvas.toDataURL({ format: 'png', quality: 1.0 })
      const blob = await (await fetch(dataUrl)).blob()
      const buf = await blob.arrayBuffer()
      const fileHash = await hashBytes(buf)
      window.hashedfile = fileHash

      $('#note').html(`<h5 class="text-info">Uploading to IPFS...</h5>`)
      const node = await Ipfs.create({ repo: 'cert-' + Math.random() })
      const { path: cid } = await node.add(blob)
      window.ipfsCid = cid

      $('#note').html(`<h5 class="text-info">Please confirm the blockchain transaction...</h5>`)
      await window.contract.methods
        .addDocHash(window.hashedfile, window.ipfsCid)
        .send({ from: window.userAddress })
        .on('transactionHash', function () {
          $('#note').html(`<h5 class="text-info">Waiting for confirmation...</h5>`) })
        .on('receipt', function (receipt) {
          $('#note').html(`<h5 class="text-success">Certificate published successfully.</h5>`)
          if (typeof printUploadInfo === 'function') printUploadInfo(receipt)
        })
        .on('error', function (error) { $('#note').html(`<h5 class="text-danger">${error.message}</h5>`) })
    } catch (e) {
      console.error(e)
      $('#note').html(`<h5 class="text-danger">${e.message || 'Certificate generation failed'}</h5>`) 
    } finally {
      document.getElementById('loader').classList.add('d-none')
    }
  }

  function downloadPNG() {
    const a = document.getElementById('btn-download')
    const url = canvas.toDataURL({ format: 'png', quality: 1.0 })
    a.href = url
  }

  window.addEventListener('load', () => {
    if (!window.location.pathname.includes('certificate.html')) return
    initCanvas()
    ensureExporterUI()

    document.getElementById('btn-add-text').addEventListener('click', () => addText())
    document.getElementById('btn-bold').addEventListener('click', () => applyStyle('bold'))
    document.getElementById('btn-italic').addEventListener('click', () => applyStyle('italic'))
    document.getElementById('btn-align-left').addEventListener('click', () => applyStyle('left'))
    document.getElementById('btn-align-center').addEventListener('click', () => applyStyle('center'))
    document.getElementById('btn-align-right').addEventListener('click', () => applyStyle('right'))
    document.getElementById('color-picker').addEventListener('input', (e) => setColor(e.target.value))
    document.getElementById('btn-preview').addEventListener('click', composeDefaultTemplate)
    document.getElementById('btn-generate').addEventListener('click', generateAndUpload)
    document.getElementById('btn-download').addEventListener('click', downloadPNG)

    // After App.js establishes role, re-check UI
    setTimeout(ensureExporterUI, 500)
  })
})()



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

  function composeDefaultTemplate(opts) {
    opts = opts || {}
    canvas.clear()
    // Background
    const bg = new fabric.Rect({ left: 0, top: 0, width: canvas.width, height: canvas.height, fill: opts.backgroundColor || '#ffffff', selectable: false, evented: false })
    const border = new fabric.Rect({ left: 20, top: 20, width: canvas.width - 40, height: canvas.height - 40, stroke: opts.borderColor || '#0c5c75', strokeWidth: opts.borderWidth || 10, fill: 'transparent', selectable: false, evented: false })
    const heading = new fabric.Text('CERTIFICATE OF ACHIEVEMENT', { left: canvas.width / 2, top: 100, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.headingSize || 46, fontWeight: 'bold', fill: opts.headingColor || '#143f4a', originX: 'center' })

    const issuer = (document.getElementById('field-issuer') || {}).value || (window.info || 'Authorised Exporter')
    const issuerText = new fabric.Text(`Issued by: ${issuer}`, { left: canvas.width / 2, top: 160, fontFamily: opts.fontFamily || 'Arial', fontSize: 20, fill: opts.textColor || '#555', originX: 'center' })

    const student = (document.getElementById('field-student') || {}).value || 'Student Name'
    const course = (document.getElementById('field-course') || {}).value || 'Course/Program'
    const grade = (document.getElementById('field-grade') || {}).value || 'N/A'
    const date = (document.getElementById('field-date') || {}).value || new Date().toISOString().slice(0, 10)

    const studentText = new fabric.Text(student, { left: canvas.width / 2, top: 260, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.studentSize || 48, fontWeight: 'bold', fill: opts.studentColor || '#111', originX: 'center' })
    const courseText = new fabric.Text(`For: ${course}`, { left: canvas.width / 2, top: 320, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.courseSize || 28, fill: opts.textColor || '#222', originX: 'center' })
    const gradeText = new fabric.Text(`Grade: ${grade}`, { left: canvas.width / 2, top: 380, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.detailSize || 22, fill: opts.textColor || '#333', originX: 'center' })
    const dateText = new fabric.Text(`Date: ${date}`, { left: canvas.width / 2, top: 420, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.detailSize || 22, fill: opts.textColor || '#333', originX: 'center' })
    const footer = new fabric.Text('Verify this certificate via the Verify page using its QR/Hash.', { left: canvas.width / 2, top: 560, fontFamily: opts.fontFamily || 'Arial', fontSize: 16, fill: '#777', originX: 'center' })

    canvas.add(bg, border, heading, issuerText, studentText, courseText, gradeText, dateText, footer)
    canvas.requestRenderAll()
  }

  function setBackgroundImageFromURL(url) {
    if (!url) return
    fabric.Image.fromURL(url, function(img) {
      const scaleX = canvas.width / img.width
      const scaleY = canvas.height / img.height
      img.set({ left: 0, top: 0, selectable: false, evented: false, originX: 'left', originY: 'top' })
      img.scaleToWidth(canvas.width)
      canvas.setBackgroundImage(img, canvas.requestRenderAll.bind(canvas))
    }, { crossOrigin: 'anonymous' })
  }

  function applyTemplate(name) {
    if (!name) return composeDefaultTemplate()
    if (name === 'classic') {
      composeDefaultTemplate({ borderColor: '#0c5c75', headingColor: '#0c5c75', backgroundColor: '#ffffff', studentColor: '#111' })
    } else if (name === 'modern') {
      composeDefaultTemplate({ borderColor: '#7c3aed', headingColor: '#7c3aed', backgroundColor: '#f8fafc', studentColor: '#0b1220' })
    } else if (name === 'minimal') {
      composeDefaultTemplate({ borderColor: '#0f172a', headingColor: '#0f172a', backgroundColor: '#ffffff', studentColor: '#0b1220' })
    } else {
      composeDefaultTemplate()
    }
  }

  function generateQRCodeAndAdd(text, size = 120) {
    if (!text) return
    const temp = document.createElement('div')
    temp.style.position = 'fixed'
    temp.style.left = '-9999px'
    document.body.appendChild(temp)
    const qr = new QRCode(temp, { width: size, height: size, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H })
    qr.makeCode(text)

    // Wait briefly for drawing
    setTimeout(() => {
      let dataUrl = null
      const canvasEl = temp.querySelector('canvas')
      const svgEl = temp.querySelector('svg')
      if (canvasEl) dataUrl = canvasEl.toDataURL('image/png')
      else if (svgEl) dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgEl.outerHTML)

      if (dataUrl) {
        fabric.Image.fromURL(dataUrl, function(img) {
          const desired = size
          img.set({ left: canvas.width - desired - 40, top: canvas.height - desired - 40, selectable: true, hasControls: true })
          img.scaleToWidth(desired)
          canvas.add(img)
          canvas.requestRenderAll()
        }, { crossOrigin: 'anonymous' })
      }
      document.body.removeChild(temp)
    }, 120)
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
      const ph = document.getElementById('preview-hash')
      if (ph) ph.textContent = fileHash

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
          $('#note').html(`<h5 class="text-success">Certificate published successfully. ${typeof window.certEmoji === 'function' ? window.certEmoji('😎', 'emoji-bounce') : '😎'}</h5>`)
          if (typeof printUploadInfo === 'function') printUploadInfo(receipt)
          const ph2 = document.getElementById('preview-hash')
          if (ph2) ph2.textContent = window.hashedfile || '—'
        })
        .on('error', function (error) { $('#note').html(`<h5 class="text-danger">${error.message}</h5>`) })
    } catch (e) {
      console.error(e)
      $('#note').html(`<h5 class="text-danger">${e.message || 'Certificate generation failed'} ${typeof window.certEmoji === 'function' ? window.certEmoji('😢', 'emoji-shake') : '😢'}</h5>`) 
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

    // Template thumbnails click -> apply
    document.querySelectorAll('.thumbnail-card').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.thumbnail-card').forEach(i => i.classList.remove('active'))
        el.classList.add('active')
        const t = el.dataset.template
        applyTemplate(t)
      })
    })

    // Template apply / clear
    const applyBtn = document.getElementById('btn-apply-template')
    const clearBtn = document.getElementById('btn-clear-template')
    if (applyBtn) applyBtn.addEventListener('click', () => {
      // if a background was uploaded, use it, otherwise apply selected thumbnail
      if (window.customTemplateURL) setBackgroundImageFromURL(window.customTemplateURL)
      else {
        const active = document.querySelector('.thumbnail-card.active')
        applyTemplate(active?.dataset?.template)
      }
    })
    if (clearBtn) clearBtn.addEventListener('click', () => {
      canvas.setBackgroundImage(null)
      composeDefaultTemplate()
    })

    // Drag & drop upload for templates
    const drop = document.getElementById('template-drop')
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover') })
      drop.addEventListener('dragleave', (e) => { e.preventDefault(); drop.classList.remove('dragover') })
      drop.addEventListener('drop', (e) => {
        e.preventDefault(); drop.classList.remove('dragover')
        const f = e.dataTransfer.files && e.dataTransfer.files[0]
        if (f) {
          window.customTemplateURL = URL.createObjectURL(f)
          setBackgroundImageFromURL(window.customTemplateURL)
        }
      })
      drop.addEventListener('click', () => {
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/*'
        inp.onchange = (ev) => {
          const f = ev.target.files && ev.target.files[0]
          if (f) { window.customTemplateURL = URL.createObjectURL(f); setBackgroundImageFromURL(window.customTemplateURL) }
        }
        inp.click()
      })
    }

    // Insert QR onto canvas using current preview hash or generated hash
    const insertQR = document.getElementById('btn-insert-qr')
    if (insertQR) insertQR.addEventListener('click', () => {
      const text = (document.getElementById('preview-hash') || {}).textContent || window.hashedfile || window.ipfsCid
      generateQRCodeAndAdd(text || `https://ipfs.io/ipfs/${window.ipfsCid || ''}`)
    })

    // After App.js establishes role, re-check UI
    setTimeout(ensureExporterUI, 500)
  })
})()



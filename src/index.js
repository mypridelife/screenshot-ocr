/**
 * 核心js文件
 * tesseract.min.js
 * worker.min.js
 * tesseract-core.js
 */
function progressUpdate(packet) {
  var log = document.getElementById('log')

  if (log.firstChild && log.firstChild.status === packet.status) {
    if ('progress' in packet) {
      var progress = log.firstChild.querySelector('progress')
      progress.value = packet.progress
    }
  } else {
    var line = document.createElement('div')
    line.status = packet.status
    var status = document.createElement('div')
    status.className = 'status'
    status.appendChild(document.createTextNode(packet.status))
    line.appendChild(status)

    if ('progress' in packet) {
      var progress = document.createElement('progress')
      progress.value = packet.progress
      progress.max = 1
      line.appendChild(progress)
    }

    if (packet.status == 'done') {
      var pre = document.createElement('pre')
      pre.appendChild(document.createTextNode(packet.data.data.text))
      line.innerHTML = ''
      line.appendChild(pre)
    }

    log.insertBefore(line, log.firstChild)
  }
}

async function recognizeFile(file) {
  document.querySelector('#log').innerHTML = ''
  console.log(window.navigator.userAgent)

  const corePath =
    window.navigator.userAgent.indexOf('Edge') > -1
      ? chrome.runtime.getURL('js/tesseract-core.asm.js')
      : chrome.runtime.getURL('js/tesseract-core.wasm.js')

  const lang = document.querySelector('#langsel').value

  const { createWorker } = Tesseract
  const worker = createWorker({
    workerPath: chrome.runtime.getURL('js/worker.min.js'),
    corePath,
    // langPath: '../traineddata',
    logger: progressUpdate,
  })
  ;(async () => {
    await worker.load()
    await worker.loadLanguage(lang)
    await worker.initialize(lang)
    const data = await worker.recognize(file)
    progressUpdate({ status: 'done', data })
  })()
}

const inputFile = document.getElementById('input-file')
// inputFile.onchange = recognizeFile((window.lastFile = this.files[0]))
inputFile.onchange = function () {
  recognizeFile(inputFile.files[0])
}
const langsel = document.getElementById('langsel')

langsel.onchange = function () {
  inputFile.files[0] && recognizeFile(inputFile.files[0])
}

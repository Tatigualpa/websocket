// server-ws.js
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 }, () => {
	console.log('WebSocket server listening on ws://localhost:8080')
})
let totalConnections = 0
let activeConnections = 0
let totalMessages = 0

function getActiveConnections() {
  return [...wss.clients].filter((c) => c.readyState === WebSocket.OPEN).length
}

function broadcastStats() {
  const active = getActiveConnections()
  const inactive = totalConnections - active

  const stats = JSON.stringify({
    type: 'stats',
    payload: {
      active,
      inactive,
      messages: totalMessages,
    },
  })

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(stats)
  })
}


wss.on('connection', (ws, req) => {
	totalConnections++

	console.log('Client connected', getActiveConnections())
	broadcastStats()

	// send welcome
	ws.send(
		JSON.stringify({ type: 'system', payload: { message: 'Bienvenido al WS de prueba' } })

	)

	ws.on('message', (raw) => {
		console.log('Received message from client')
		totalMessages++
		let msg
		try {
			msg = JSON.parse(raw)
		} catch (e) {
			msg = { type: 'text', payload: raw.toString() }
		}

		// Determine broadcast structure based on message type
		let broadcast
		if (msg.type === 'file') {
			broadcast = JSON.stringify({
				type: 'broadcast',
				messageType: 'file',
				payload: {
					from: 'user',
					fileName: msg.payload.fileName,
					fileSize: msg.payload.fileSize,
					fileType: msg.payload.fileType,
					fileData: msg.payload.fileData,
					receivedAt: Date.now(),
				},
			})
		} else {
			// Handle text messages properly
			let messageText = ''
			if (typeof msg.payload === 'string') {
				messageText = msg.payload
			} else if (msg.payload && msg.payload.text) {
				messageText = msg.payload.text
			} else if (msg.payload && msg.payload.message) {
				messageText = msg.payload.message
			} else {
				messageText = String(msg.payload)
			}

			broadcast = JSON.stringify({
				type: 'broadcast',
				messageType: 'text',
				payload: {
					from: 'user',
					message: messageText,
					text: messageText, // Include both for compatibility
					receivedAt: Date.now(),
				},
			})
		}

		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(broadcast)
			}
		})

		broadcastStats()
	})

	ws.on('close', () => {
		setTimeout(() => {
      console.log("Client disconnected. Active:", getActiveConnections())
      broadcastStats()
    }, 20)
	})

	ws.on('error', (err) => {
		console.error('WS Error:', err)
	})
})


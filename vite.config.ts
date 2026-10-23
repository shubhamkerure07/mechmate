import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/diagnose'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-diagnose-middleware',
      configureServer(server) {
        server.middlewares.use('/api/diagnose', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method Not Allowed' }))
            return
          }

          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsedBody = body ? JSON.parse(body) : {}
              const mockReq = { method: req.method, body: parsedBody }
              const mockRes = {
                status(code: number) {
                  res.statusCode = code
                  return this
                },
                json(payload: any) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(payload))
                  return this
                }
              }
              await handler(mockReq, mockRes)
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err?.message || 'Server Error' }))
            }
          })
        })
      }
    }
  ]
})

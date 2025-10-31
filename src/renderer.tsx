import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TLS eDiscovery Platform - Turman Legal Solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>{children}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})

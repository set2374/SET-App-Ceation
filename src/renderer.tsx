import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TLS eDiscovery Platform - Turman Legal Solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>{children}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})

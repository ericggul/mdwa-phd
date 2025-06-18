export default function handler(req, res) {
  // Set headers for image response
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000');
  
  // Generate an HTML-based Open Graph image (will be converted by social platforms)
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1a1a1a 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .background-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.1;
            background-image: 
              radial-gradient(circle at 25% 25%, #fff 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px);
            background-size: 50px 50px;
          }
          
          .content {
            text-align: center;
            z-index: 1;
            max-width: 1000px;
            padding: 40px;
          }
          
          .title {
            font-size: 72px;
            font-weight: 900;
            margin-bottom: 20px;
            line-height: 1.1;
            background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .subtitle {
            font-size: 36px;
            font-weight: 300;
            margin-bottom: 30px;
            color: #b0b0b0;
          }
          
          .author {
            font-size: 28px;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 10px;
          }
          
          .institution {
            font-size: 24px;
            font-weight: 300;
            color: #888;
          }
          
          .accent {
            position: absolute;
            top: 50px;
            right: 50px;
            width: 200px;
            height: 200px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
          }
          
          .accent::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
          }
        </style>
      </head>
      <body>
        <div class="background-pattern"></div>
        <div class="accent"></div>
        <div class="content">
          <div class="title">MDWA</div>
          <div class="subtitle">Multi-Device Web Artwork</div>
          <div class="author">Jeanyoon Choi</div>
          <div class="institution">PhD Research · KAIST XD Lab</div>
        </div>
      </body>
    </html>
  `;
  
  res.status(200).send(html);
} 
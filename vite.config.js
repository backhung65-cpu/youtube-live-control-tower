import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    {
      name: 'disk-writer',
      generateBundle(options, bundle) {
        fs.mkdirSync('./dist/assets', { recursive: true });
        let jsFile = '';
        let cssFile = '';
        for (const [fileName, item] of Object.entries(bundle)) {
          const target = path.join('./dist', fileName);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, item.code || item.source);
          if (fileName.endsWith('.js') && fileName.includes('index')) jsFile = fileName;
          if (fileName.endsWith('.css') && fileName.includes('index')) cssFile = fileName;
        }
        let html = fs.readFileSync('./index.html', 'utf-8');
        html = html.replace('<script type="module" src="./src/main.jsx"></script>', '');
        html = html.replace('/favicon.svg', './favicon.svg');
        const injectTags = `
    <script type="module" crossorigin src="./${jsFile}"></script>
    <link rel="stylesheet" crossorigin href="./${cssFile}">
  </head>`;
        html = html.replace('</head>', injectTags);
        fs.writeFileSync('./dist/index.html', html, 'utf-8');
        if (fs.existsSync('./public')) {
          fs.cpSync('./public', './dist', { recursive: true });
        }
      },
    },
  ],
  build: {
    write: false,
  },
});

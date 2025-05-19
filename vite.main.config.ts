import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async () => {
  const {viteStaticCopy} = await import('vite-plugin-static-copy')
  return {
    resolve: {
      // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
      browserField: false,
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: './ssl',
            dest: ''
          }
        ]
      })
    ]
  }
});

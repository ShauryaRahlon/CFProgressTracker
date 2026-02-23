import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: __dirname,
      root: __dirname,
    },
  },
};

export default config;

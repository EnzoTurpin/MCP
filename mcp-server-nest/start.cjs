const path = require('path');
const tsNode = require(path.join(__dirname, '../node_modules/ts-node'));

tsNode.register({
  project: path.join(__dirname, 'tsconfig.json'),
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

require('./src/main.ts');

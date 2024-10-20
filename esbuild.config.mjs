import esbuild from 'esbuild';

const opts = {
    entryPoints: {
        index: 'src/index.html',
        script: 'src/scripts/index.ts',
        style: 'src/styles/index.css',
    },
    outdir: 'dist',
    bundle: true,
    loader: { '.html': 'copy' },
    logLevel: 'info',
    color: true,
};

const prodOpts = {
    ...opts,
    minify: true,
};

const devOpts = {
    ...opts,
    sourcemap: true,
    outdir: 'dev',
    define: { 'window.DEVELOPMENT': 'true' },
};

const environment = process.argv.slice(2)[0] || process.env.NODE_ENV;

switch (environment) {
    case 'production': {
        await esbuild.build(prodOpts);
        break;
    }
    case 'development': {
        const context = await esbuild.context(devOpts);
        await context.watch();
        await context.serve({ servedir: 'dev' });
        break;
    }
    default: {
        console.log('Available environments:\n| 1. production\n| 2. development');
    }
}

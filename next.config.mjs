// next.config.mjs
import withSourceMaps from '@zeit/next-source-maps';
import withBundleAnalyzer from '@next/bundle-analyzer';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  env: {
    API_URL: process.env.API_URL,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
  },
  webpack(config, options) {
    if (!options.isServer) {
      config.devtool = isProd ? 'source-map' : 'eval-source-map';
    }

    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    return config;
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withSourceMaps(nextConfig));

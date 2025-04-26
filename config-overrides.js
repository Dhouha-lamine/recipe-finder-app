module.exports = function override(config) {
    // Disable Node.js core modules that aren't needed in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      https: false,
      http: false,
      url: false,
      child_process: false,
      fs: false,
    };
    return config;
  };
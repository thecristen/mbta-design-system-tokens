module.exports = {
  source: ['tokens.json'],
  parsers: [{
    pattern: /\.json$/,
    parse: ({ filePath, contents }) => {
      try {
        const { base } = JSON.parse(contents);
        return base;
      } catch (error) {
        console.error(error);
      }
    }
  }],
  platforms: {
    css: {
      "transformGroup": "css",
      "files": [
        {
          "format": "css/variables",
          "destination": "variables.css"
        }
      ]
    }
  }
}

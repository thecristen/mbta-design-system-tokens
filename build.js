const fs = require("fs");
const StyleDictionary = require("style-dictionary");

const SOURCE_FILE = "tokens.json";
const TOKENS_DIR = "./tokens"

const tokenConfig = JSON.parse(fs.readFileSync(SOURCE_FILE).toString());
const baseTheme = {
  gtfs: {}
};
tokenConfig.$metadata.tokenSetOrder
  .filter(name => !["Color/Light", "Color/Dark"].includes(name))
  .forEach((tokenset) => {
    Object.entries(tokenConfig[tokenset]).forEach(([key, value]) => {
      if (tokenset == "MBTA System/GTFS Color") {
        baseTheme.gtfs[key] = value;
      } else {
        baseTheme[key] = value;
      }
    });
  });
const lightTheme = tokenConfig["Color/Light"];
const darkTheme = tokenConfig["Color/Dark"];

fs.writeFileSync(`${TOKENS_DIR}/base.json`, JSON.stringify(baseTheme));
fs.writeFileSync(`${TOKENS_DIR}/light.json`, JSON.stringify(lightTheme));
fs.writeFileSync(`${TOKENS_DIR}/dark.json`, JSON.stringify(darkTheme));

function getStyleDictionaryConfig(theme) {
  return {
    source: ["tokens/base.json", `tokens/${theme}.json`],
    platforms: {
      css: {
        transformGroup: "custom/web",
        buildPath: "build/",
        options: {
          outputReferences: true,
        },
        files: [
          {
            format: "css/variables",
            destination: `${theme}.css`
          }
        ],
      },
      js: {
        transformGroup: "custom/js",
        buildPath: "build/",
        files: [
          {
            destination: `${theme}.json`,
            format: "json/nested",
          },
        ],
      },
      scss: {
        transformGroup: "custom/scss",
        buildPath: "build/",
        options: {
          outputReferences: true,
        },
        files: [
          {
            destination: `_${theme}.scss`,
            format: "scss/variables",
          },
        ],
      },
      android: {
        transformGroup: "custom/android",
        buildPath: "build/",
        options: {
          outputReferences: true,
        },
        files: [
          {
            destination: `${theme}.xml`,
            format: "android/resources",
          },
        ],
      }
    }
  }
}

StyleDictionary
  .registerTransform({
    name: 'numberToPx',
    type: 'value',
    matcher: function (token) {
      return ['spacing', 'font'].includes(token.attributes.category) && token.type == 'number';
    },
    transformer: function (token) {
      return `${token.value}px`;
    }
  })
  .registerTransform({
    name: 'numberToMs',
    type: 'value',
    matcher: function (token) {
      return token.attributes.category == "timing" && token.type == 'number';
    },
    transformer: function (token) {
      return `${token.value}ms`;
    }
  })

for (const group of ['web', 'js', 'android', 'scss']) {
  const transforms = StyleDictionary.transformGroup[group];
  transforms.push("numberToPx");
  transforms.push("numberToMs");
  StyleDictionary.registerTransformGroup({
    name: `custom/${group}`,
    transforms
  })
}

['dark', 'light'].map(function (theme) {
  const config = getStyleDictionaryConfig(theme);
  StyleDictionary
    .extend(config)
    .buildAllPlatforms();
});



let config = {
  development: {
    host: `https://${process.env.ADMIN__DOMAIN}`,
    assets: 'public/dev',
    serverApi: '/',
    // Скрины
    setSiteScreenUrl(nameImg) {
      return `${this.host}/images/sites-screens/${nameImg}.png`;
    },
    setSiteScreenAssets(nameImg) {
      return `${this.assets}/images/sites-screens/${nameImg}.png`;
    },
    // Логотипы
    setSiteLogoUrl(nameImg) {
      return nameImg
        ? `${this.host}/images/sites-logos/${nameImg}.png`
        : this.setSiteLogoUrlDefault();
    },
    setSiteLogoUrlDefault() {
      return `${this.host}/images/default.jpg`;
    },
    setSiteLogoAssets(nameImg) {
      return `${this.assets}/images/sites-logos/${nameImg}.png`;
    },
    setWhoisJSONpath({ type, siteId }) {
      return `data/${type}/${siteId}.json`;
    },
  },
  production: {
    host: `http://localhost:${process.env.API__PORT}/`,
    assets: 'public/dev',
    serverApi: '/',
    // Скрины
    setSiteScreenUrl(nameImg) {
      return `${this.host}images/sites-screens/${nameImg}.png`;
    },
    setSiteScreenAssets(nameImg) {
      return `${this.assets}/images/sites-screens/${nameImg}.png`;
    },
    // Логотипы
    setSiteLogoUrl(nameImg) {
      return nameImg
        ? `${this.host}images/sites-logos/${nameImg}.png`
        : this.setSiteLogoUrlDefault();
    },
    setSiteLogoUrlDefault() {
      return `${this.host}images/default.jpg`;
    },
    setSiteLogoAssets(nameImg) {
      return `${this.assets}/images/sites-logos/${nameImg}.png`;
    },
  },
};

module.exports = config[process.env.NODE_ENV];

const HOST_URL = "https://imageml2.webduino.io";

class Hasher {
  constructor() {
    const strCookie = document.cookie;
    const idx = strCookie.indexOf(" userId=");
    this.userId = ((idx === -1) ? -1 : parseInt(strCookie.slice(idx+8)));
    this.idCode = ('00000000' + this.userId).slice(-8);
    }

    getUIUrl() {
        const uiHasher = new Hashids.default('oMKeFPg0GHBU', 32, '0123456789abcdef');
        return HOST_URL + '/#' + uiHasher.encode([this.userId]);
    }
    getAPIHash() {
        const apiHasher = new Hashids.default('X5lM3VPyBvm', 32, '0123456789abcdef');
        return apiHasher.encode([this.userId], Date.now());
    }
}
var hasher = new Hasher();
let secretoPeticion = 'csoftprosofdesarrollo';

$(function () {
    $.Encriptar = function (datos) {
        const salt = CryptoJS.lib.WordArray.random(256);
		const iv = CryptoJS.lib.WordArray.random(16);
		const key = CryptoJS.PBKDF2(secretoPeticion, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 30 });
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, { iv: iv });
		const data = {
			ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
			salt: CryptoJS.enc.Hex.stringify(salt),
			iv: CryptoJS.enc.Hex.stringify(iv)
		}
		return JSON.stringify(data);
    }

    $.Desencriptar = function (encriptado) {
        const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
        const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
        const key = CryptoJS.PBKDF2(secretoPeticion, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 30 });
        const decrypted = CryptoJS.AES.decrypt(encriptado.ciphertext, key, { iv: iv });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

});
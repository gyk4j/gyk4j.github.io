/** 
* Protected Contact Info - v1.0
* URL: https://github.com/gyk4j.github.io
* Author: gyk4j
*/
(async function () {
  "use strict";

  function _T(str) {
    var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
    var index     = x => input.indexOf(x);
    var translate = x => index(x) > -1 ? output[index(x)] : x;
    return str.split('').map(translate).join('');
  }

  const ALGORITHM = _T("NRF").concat("-").concat(_T("POP")); // "AES-CBC";
  const IV_LEN = eval(_T("2**4"));
  const KEY_LEN = eval(_T("2**8"));
  const KEY_EXTRACTABLE = true;
  const KEY_USAGES = [_T("rapelcg"), _T("qrpelcg")]; //["encrypt", "decrypt"];
  const KEY_ENCODING_FORMAT = _T("enj") // "raw"

  // Import the WebCrypto API
  const _C = window.crypto
  const _S = _C.subtle

  async function encrypt(plaintext){
    console.log(ALGORITHM)
    console.log(KEY_LEN)
    console.log(IV_LEN)
    console.log(KEY_USAGES)

    // Generate a random key
    const key = await _S.generateKey( 
      { 
        name: ALGORITHM, 
        length: KEY_LEN, 
      }, 
      KEY_EXTRACTABLE, 
      KEY_USAGES 
    );
    const exported = await _S.exportKey(KEY_ENCODING_FORMAT, key);

    // Generate IV
    const iv = _C.getRandomValues(new Uint8Array(IV_LEN));
    
    // Encrypt some data
    const data = new TextEncoder().encode(plaintext);

    const encrypted = await _S.encrypt( 
      { 
        name: ALGORITHM, 
        iv: iv, 
      }, 
      key, 
      data 
    );

    return {
      "i": arrayBufferToBase64(iv),
      "k": arrayBufferToBase64(exported),
      "c": arrayBufferToBase64(encrypted)
    }
  }
  
  async function decrypt(ciphertext){
    const exported = base64ToArrayBuffer(ciphertext.k)
    const key = await _S.importKey(
      KEY_ENCODING_FORMAT, 
      exported, 
      ALGORITHM, 
      KEY_EXTRACTABLE, 
      KEY_USAGES
    );

    const decryptedData = await _S.decrypt( 
      { 
        name: ALGORITHM, 
        iv: base64ToArrayBuffer(ciphertext.i), 
      }, 
      key, 
      base64ToArrayBuffer(ciphertext.c) 
    );
  
    const plaintext = new TextDecoder().decode(decryptedData)
    return plaintext
  }

  function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary ); // string of char 0-255
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64); // string of char 0-255
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  function init() {
    let e = document.getElementById(_T("rapelcg")) // "encrypt"
    
    if(e === null) return;

    e.addEventListener('submit', async function(event) {
      event.preventDefault();

      let thisForm = this;
      let locationInput = thisForm.querySelector('input[name="l"]')
      let location = locationInput.value
      let emailInput = thisForm.querySelector('input[name="m"]')
      let email = emailInput.value
      let phoneInput = thisForm.querySelector('input[name="p"]')
      let phone = phoneInput.value
      let phoneFirst = phone.substring(0, 4) 
      let phoneLast = phone.substring(4, 8)

      let data = { 
        l: location,
        m: email,
        p: `+65 ${phoneFirst} ${phoneLast}`
      }
      
      let encrypted = await encrypt(JSON.stringify(data))

      let iv = document.getElementById('i')
      iv.textContent = _T(encrypted.i)

      let key = document.getElementById('k')
      key.textContent = _T(encrypted.k)

      let ciphertext = document.getElementById('c')
      ciphertext.textContent = _T(encrypted.c)

      let plaintext = document.getElementById('p')
      plaintext.textContent = await decrypt(encrypted)
    })

   
  }

  const msg = "Click/tap to reveal"

  function fillAll(selector, value){
    let elements = document.querySelectorAll(selector)
    elements.forEach(function(e){
      e.dataset.text = value

      if(e.tagName === "A" || e.tagName === "a"){
        e.href = null
        e.addEventListener("mouseenter", function() { flipLink(e) })
        e.addEventListener("mouseleave", function() { flipLink(e) })
        console.log(e)
      }
      else {
        e.textContent = msg
        e.addEventListener("mouseenter", function() { flipText(e) })
        e.addEventListener("mouseleave", function() { flipText(e) })
      }
    })
  }

  function flipLink(e) {
    if(e.href == e.dataset.text){
      e.href = null
    }
    else{
      e.href = e.dataset.text
    }
  }

  function flipText(e) {
    if(e.textContent == e.dataset.text){
      e.textContent = msg
    }
    else{
      e.textContent = e.dataset.text
    }
  }
  
  init()

  let i = {
    i: _T("INSTNmfOtAwIQboBFGbPgj=="),
    k: _T("MZJG8IFCusRNrMoZ+c+34sEtqHNnjxThW4ceJjLwGSb="),
    c: _T("F0KgABceSmRFSgMQlMCDhuzZo5e43UW2J9XljLSdxUWX8lXo95Y0/T9J+XY8Viof0+wRChUUZzkIsIWLd3Hq6DZGnDtlB8X5py+K2LoJR+R=")
  }
  let o = await decrypt(i)
  let contact = JSON.parse(o)

  fillAll(".contact-location", contact.l)
  fillAll(".contact-email", contact.m)
  fillAll(".contact-phone", contact.p)
  fillAll("a.whatsapp", "https://wa.me/" + contact.p.replaceAll("+", "").replaceAll(" ", ""))
  fillAll("a.telegram", "https://t.me/" + contact.p.replaceAll(" ", ""))
  fillAll("a.envelope", "mailto:" + contact.m)
})();
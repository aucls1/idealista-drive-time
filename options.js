const input = document.getElementById('key');
chrome.storage.local.get('orsKey').then(({ orsKey }) => { if (orsKey) input.value = orsKey; });
document.getElementById('save').onclick = async () => {
  await chrome.storage.local.set({ orsKey: input.value.trim() });
  document.getElementById('msg').textContent = 'Guardado.';
};

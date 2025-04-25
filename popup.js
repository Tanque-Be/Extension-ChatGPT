document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.executeScript({
    code: `
      (function() {
        let promptEl = document.querySelector('div.markdown.prose');
        let prompt = promptEl ? promptEl.innerText : 'Prompt no encontrado';
        // Responses: ChatGPT messages in div.text-base with sibling structure
        let responseEls = document.querySelectorAll('div.markdown.prose + div.markdown.prose');
        let responses = Array.from(responseEls).map(el => el.innerText);
        return [prompt, responses];
      })();
    `
  }, function (result) {
    if (!result || !result[0]) {
      document.getElementById('selectedPrompt').innerText = '❌ No se encontró el prompt.';
      return;
    }

    const [prompt, responses] = result[0];
    document.getElementById('selectedPrompt').innerText = prompt;

    const form = document.getElementById('responsesForm');
    responses.forEach((response, index) => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = response;
      checkbox.name = 'response';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(response.substring(0, 100) + (response.length > 100 ? '...' : '')));
      form.appendChild(label);
    });
  });

  document.getElementById('saveBtn').addEventListener('click', function () {
    const checkedResponses = Array.from(document.querySelectorAll('input[name="response"]:checked')).map(el => el.value);
    const promptText = document.getElementById('selectedPrompt').innerText;

    if (!checkedResponses.length) {
      alert('Selecciona al menos una respuesta para guardar.');
      return;
    }

    fetch('https://script.google.com/macros/s/AKfycbzhIQnmB4Z2QZ0f26EayObKwf5Zs8b3thMfsI2b-DF5xWafYfD2EgYg6QCG2dqwIZxM/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: promptText, responses: checkedResponses })
    })
    .then(res => {
      if (res.ok) {
        alert('✅ Conversación guardada con éxito!');
      } else {
        alert('❌ Error al guardar en Zapier.');
      }
    });
  });
});
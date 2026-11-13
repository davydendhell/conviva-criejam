# Conviva Simulador — PWA

Estrutura de Progressive Web App para publicar o simulador no GitHub Pages. O shell é responsivo, inclui manifesto e service worker para guardar a aplicação localmente depois do primeiro acesso online.

## Incluir o documento original

Adicione o HTML fornecido como `Conviva Simulador.html` na raiz deste repositório (ao lado de `index.html`). O `index.html` carrega esse documento no app.

## Ativar GitHub Pages

No GitHub, abra **Settings → Pages**, escolha **Deploy from a branch**, selecione `main` e a pasta `/(root)`, e salve. A URL terá o formato `https://davydendhell.github.io/conviva-simulador/`.

Após a publicação, abra essa URL com internet ao menos uma vez. O service worker armazenará o shell e o HTML do simulador para acessos posteriores sem conexão. Recursos remotos (por exemplo, Google Fonts e recursos de IA fornecidos pelo ambiente Claude) podem não funcionar offline; os dados locais do navegador permanecem no dispositivo.

Para publicar atualizações do app, altere `CACHE_NAME` em `sw.js` para invalidar o cache anterior.

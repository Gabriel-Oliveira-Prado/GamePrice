# Como rodar no Docker Desktop

## Opção 1: Usando Docker Compose (Recomendado)

1. Abra o Docker Desktop
2. No terminal, navegue até a pasta do projeto
3. Execute:
```bash
docker-compose up --build
```
4. Acesse no navegador: http://localhost:8080

Para parar:
```bash
docker-compose down
```

## Opção 2: Usando Docker direto

1. Construir a imagem:
```bash
docker build -t gameprice .
```

2. Rodar o container:
```bash
docker run -d -p 8080:8080 --name gameprice-web -e ASPNETCORE_ENVIRONMENT=Development gameprice
```

3. Acesse no navegador: http://localhost:8080

Para parar:
```bash
docker stop gameprice-web
docker rm gameprice-web
```

## Troubleshooting

- Se a porta 8080 já estiver em uso, mude para outra porta (ex: 5000:8080)
- Verifique se o Docker Desktop está rodando
- Execute `docker logs gameprice-web` para ver os logs do container

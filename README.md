# GamePrice

Aplicação web do GamePrice para descobrir preços de jogos, acompanhar ofertas e organizar uma lista de desejos. A interface é construída com ASP.NET Core MVC e consome a API do ecossistema GamePrice.

## Funcionalidades

- Pesquisa de jogos e comparação de preços entre lojas.
- Exibição de ofertas em destaque e jogos gratuitos.
- Cadastro, autenticação e gerenciamento de perfil.
- Lista de desejos com preço-alvo por jogo.
- Interface responsiva com páginas de privacidade, termos e recursos.

## Como funciona

Esta aplicação é a camada de apresentação do projeto. Ela solicita os dados à `GamePrice.Api`, que centraliza autenticação, persistência e integração com o serviço de scraping. Para as pesquisas de preço, a API encaminha a consulta ao `GamePrice.Scraper`; o resultado consolidado é então exibido ao usuário.

```text
Navegador -> GamePrice (MVC) -> GamePrice.Api -> GamePrice.Scraper -> Lojas e feeds
                                  |
                                  -> SQLite
```

## Tecnologias

- .NET 9 e ASP.NET Core MVC
- Autenticação por cookies
- `HttpClient` para integração com a API
- Bootstrap, CSS e JavaScript
- Docker e Docker Compose

## Pré-requisitos

Para executar localmente, instale:

- .NET SDK 9.0 ou superior compatível
- Os projetos `GamePrice.Api` e `GamePrice.Scraper` em diretórios irmãos deste repositório

Para a execução em contêineres, instale o Docker Desktop.

## Execução local

Inicie primeiro o scraper na porta `8000` e a API na porta `5098`. Em seguida, neste diretório, execute:

```powershell
dotnet restore
dotnet run --launch-profile http
```

A aplicação estará disponível em `http://localhost:5296`.

Por padrão, a interface procura a API em `http://localhost:5098`. Para apontá-la para outro endereço durante a sessão atual do PowerShell, defina a variável abaixo antes de executar o projeto:

```powershell
$env:ApiSettings__GamePriceApiUrl = "http://localhost:PORTA"
```

## Execução com Docker Compose

Com os três repositórios clonados lado a lado, execute neste diretório:

```powershell
docker compose up --build
```

Serviços disponibilizados:

| Serviço | Endereço |
| --- | --- |
| Interface web | `http://localhost:8080` |
| API | `http://localhost:5200` |
| Scraper | `http://localhost:8000` |

Para encerrar os contêineres:

```powershell
docker compose down
```

O volume `gameprice-data` preserva o banco SQLite utilizado pela API entre reinicializações dos contêineres.

## Configuração

As URLs dos serviços ficam em `appsettings.json`, na seção `ApiSettings`:

```json
{
  "ApiSettings": {
    "GamePriceApiUrl": "http://localhost:5098",
    "ScraperApiUrl": "http://localhost:8000"
  }
}
```

Na execução com Docker Compose, a URL da API é configurada automaticamente para comunicação entre contêineres.

## Projetos relacionados

- [GamePrice.Api](https://github.com/Gabriel-Oliveira-Prado/GamePrice.Api): API, autenticação e persistência.
- [GamePrice.Scraper](https://github.com/Gabriel-Oliveira-Prado/GamePrice.Scraper): coleta de preços, ofertas e jogos gratuitos.

## Autor

Desenvolvido por [Gabriel Oliveira Prado](https://github.com/Gabriel-Oliveira-Prado).

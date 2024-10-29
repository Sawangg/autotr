# AutoTR

Rest API to interact with Trade Republic's brokerage services. Execute any order on your Trade Republic account and
more!

## Install

This project uses [bun](https://bun.sh/), install it locally. Next install the projects dependencies

```sh
bun i
```
You need to create a `.env` file at the root of the project with your Trade Republic credentials matching the
`.env.example` syntax.

## Pair your account to the API

Once everything is installed, we need to pair the API with your Trade Republic account (this will log you out of your
main device).

```sh
bun run src/pair.ts
```
Once the API is paired, you can query this REST API indefinitely.

> NOTE:
> If you decide to pair your phone again, the API will stop working. Use the web app to check your account. To login to
> the web app, you'll need to send the verification code by SMS because your app won't be enrolled anymore.

## Run

You can start the development server by running

```sh
bun dev
```

### Production

**⚠️ Becareful how your exposing the API because anyone can query it meaning anyone can interact with your TradeRepublic
account! ⚠️**

You need to build the project and then start it

```sh
bun run build
bun start
```
## Credits

[J05HI's Documentation](https://github.com/J05HI/pytru)

_I am not affiliated with TradeRepublic_

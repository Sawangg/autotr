# AutoTR

Rest API to interact with Trade Republic's brokerage services. Execute any order on your Trade Republic account and
more!

## How to use

First of you need to download the latest pair script in the [release tab](https://github.com/Sawangg/autotr/releases).
Execute it and save the keys in a text file or something of your choosing.

> [!IMPORTANT]
> When you pair your device with the API, you will loose access on your phone. If you decide to pair your phone again,
> the API will stop working. Use the web app to check your account. To login to the web app, you'll need to send the
> verification code by SMS because your app won't be enrolled anymore.

**⚠️ Becareful how you're exposing the API because anyone can query it meaning anyone can interact with your Trade Republic
account! ⚠️**

Now you can run the docker image like so

```sh
podman run -d -p 3000:3000 --restart on-failure \
           -e PHONE_NUMBER="<your_phone_number>" \
           -e PIN="<your_pin>" \
           -e PUBLIC_KEY="<your_public_key>" \
           -e PRIVATE_KEY="<your_private_key>" \
           ghcr.io/sawangg/autotr:latest
```

You can now query the server `http://localhost:3000/api`!

## Development

This project uses [bun](https://bun.sh/), install it locally. Next install the projects dependencies

```sh
bun i
```
You need to create a `.env` file at the root of the project with your Trade Republic credentials matching the
`.env.example` syntax. You'll need to execute the pair script found in the [release
tab](https://github.com/Sawangg/autotr/releases) and use the keys in the `.env`.

You can then start the development server by running

```sh
bun dev
```

_I am not affiliated with Trade Republic_

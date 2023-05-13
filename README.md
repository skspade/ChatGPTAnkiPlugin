# Anki Deck Creator ChatGPT Plugin

This README provides a guide on how to use the Anki Deck Creator as a plugin for ChatGPT. Please follow the steps below to get started.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/).
- You have installed [NestJS](https://nestjs.com/).
- You have installed [Anki](https://apps.ankiweb.net/), a powerful flashcards app.
- You have installed [AnkiConnect](https://github.com/FooSoft/anki-connect), a plugin for Anki, which allows external apps to communicate with Anki over a web-based API.

## Setup

1. Clone this repository to your local machine.

```bash
git clone https://github.com/skspade/ChatGPTAnkiPlugin.git
```

2. Navigate to the project directory.

```bash
cd chatgptanki
```

3. Install the dependencies.

```bash
npm install
```

## Usage

### Starting the application

To start the application, run the following command:

```bash
npm run start
```

This will start the server at http://localhost:3333 (unless you have a different port specified in your `.env` file).

### Using the plugin
You must switch to the plugin mode in ChatGPT to use the plugin. To do this, click on the `Plugin` button in the top right corner of the ChatGPT interface.
Then you must install the plugin by going to the Plugin Store, once there click `Develop your own plugin` and enter the URL of the plugin server (http://localhost:3333 by default).

### Plugin Endpoints

- `GET /.well-known/ai-plugin.json`: This endpoint serves the AI plugin manifest file.
- `GET /openapi.yaml`: This endpoint serves the OpenAPI specification in YAML format.
- `GET /openapi.json`: This endpoint serves the OpenAPI specification in JSON format.
- `GET /logo.png`: This endpoint serves the logo of the plugin.

### ChatGPT Interactions

- `POST /createDeck`: This endpoint is used to create a new deck. It takes a `DeckRequest` object in the request body.
- `POST /addCards`: This endpoint is used to add notes to a deck. It takes a `NotesRequest` object in the request body.

## Troubleshooting

If you encounter any errors, please check the console logs for any error messages or warnings.

## Contributing

For any improvements, bug reports or feature requests, please file an issue in the GitHub repo.

## License

This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/MIT).

## Contact

If you want to contact me, please raise an issue in the GitHub repo or contact me through my email.

## Acknowledgments

This project was created as a plugin for the ChatGPT model developed by OpenAI.

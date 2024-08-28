import { http, passthrough, HttpResponse, bypass } from "msw";
import { setupServer } from "msw/node";
import axios from "axios";

const handlers = [
  http.get("https://pirate.monkeyness.com/api/insult", ({ request }) => {
    console.log(request.url);
    const pass = passthrough();
    console.log(pass);
    return pass;
  }),
  http.get(
    "https://pirate.monkeyness.com/api/translate",
    async ({ request }) => {
      const response = await fetch(bypass(request));
      const pirateTranslation = await response.text();

      return HttpResponse.json({
        translation: pirateTranslation,
        metadata: {
          isCat: true,
        },
      });
    }
  ),
];

const server = setupServer(...handlers);

async function processResponse({ response }) {
  console.log("Intercepted response: " + await response.text());
}

server.events.on("response:bypass", processResponse);

server.listen();

const fetchInsult = async () => {
  const response = await axios.get("https://pirate.monkeyness.com/api/insult");

  return response.data;
};

const fetchPirateTranslation = async (textToTranslate) => {
  const urlParams = new URLSearchParams();
  urlParams.set("english", textToTranslate);

  const response = await axios.get(
    `https://pirate.monkeyness.com/api/translate?${urlParams.toString()}`
  );

  return response.data;
};

async function app() {
  console.log(await fetchInsult());
  console.log(await fetchPirateTranslation("Hello there, General Kenobi!"));
}

await app();

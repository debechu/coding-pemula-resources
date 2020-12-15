const { readdirSync, readFileSync } = require("fs");

const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

const { Client } = require("discord.js")
let client = new Client();

client.resources = {};
(function LoadResources()
{
    const categories = readdirSync("./Resources");
    for (const category of categories)
    {
        client.resources[category] = new Array();
        const base_path = `./Resources/${category}`;
        const files = readdirSync(base_path);

        for (const file of files)
        {
            client.resources[category].push(
                JSON.parse(readFileSync(`${base_path}/${file}`).toString())
            );
        }
    }
})();

function ResourceToString(resource)
{
    return `${resource.name} (${resource.languages}): ${resource.url}`;
}

function MakeMessageContent(category)
{
    return `__**${category}**_\n`
        + client.resources[category]
            .map((resource) => ResourceToString(resource))
            .join('\n');
}

async function PostResources(channel)
{
    for (const category of Object.keys(client.resources))
    {
        const content = MakeMessageContent(category);
        await channel.send(content, { split: true });
    }
}

client.on("ready", async () => {
    let channel = await client.channels.fetch(CHANNEL_ID);
    await channel.bulkDelete(await channel.messages.fetch({ limit: 100 }));
    await PostResources(channel);
});

client.login(BOT_TOKEN);
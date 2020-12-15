const { readdirSync, readFileSync } = require("fs");
const { request } = require("https");

const CONTENT_MAX_SIZE = 2000;
const WEBHOOK_ID = process.env.WEBHOOK_ID;
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN;

let resources = {};
(function LoadResources()
{
    const categories = readdirSync("./Resources");
    for (const category of categories)
    {
        resources[category] = new Array();
        const base_path = `./Resources/${category}`;
        const files = readdirSync(base_path);

        for (const file of files)
        {
            resources[category].push(
                JSON.parse(readFileSync(`${base_path}/${file}`).toString())
            );
        }
    }
})();

function ResourceToString(resource)
{
    return `${resource.name} (${resource.languages}): ${resource.url}`;
}

function MakeDiscordMessages(category)
{
    return resources[category].reduce(
        (acc, resource) => {
            const str = ResourceToString(resource);
            if (acc[acc.length-1].length + str.length + 1 > CONTENT_MAX_SIZE)
            {
                acc.push(new String());
            }
            acc[acc.length-1] += str + '\n';
            return acc;
        }, [`__**${category}**__\n`]
    ).map((str => {
        return { content: str };
    }));
}

async function PostDiscordMessage(message)
{
    let data = JSON.stringify(message);
    let options = {
        host: "discord.com",
        port: 443,
        path: `/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length
        }
    };

    return new Promise((resolve, reject) => {
        let req = request(options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log("Headers:", res.headers);

            res.on("data", (chunk) => {
                process.stdout.write(chunk);
            })

            if (res.statusCode >= 200 && res.statusCode < 300)
                resolve();
            else
                reject();
        });

        req.write(data);
        req.end();
    });
}

(async function PostResources()
{
    for (const category of Object.keys(resources))
    {
        const messages = MakeDiscordMessages(category);
        for (const message of messages)
        {
            await PostDiscordMessage(message);
        }
    }
})();
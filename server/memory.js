const fs = require("fs");

const MEMORY_FILE = "./memory.json";

let database = {};

if (fs.existsSync(MEMORY_FILE)) {

    try {

        database = JSON.parse(
            fs.readFileSync(
                MEMORY_FILE,
                "utf8"
            )
        );

    } catch {

        database = {};
    }
}

function saveMemory(
       conversations,
    userStates,
    clientProfiles

) {

    const db = {};

    Object.keys(conversations).forEach(
        user => {

           db[user] = {
    history: conversations[user],
    state: userStates[user],
    profile: clientProfiles[user]
};
        }
    );

    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify(
            db,
            null,
            2
        )
    );
}

module.exports = {
    database,
    saveMemory
};
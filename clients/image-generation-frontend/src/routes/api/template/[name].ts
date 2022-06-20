import type { Request } from "@sveltejs/kit";

export async function get({params}: Request) {
    console.log(params);
    // TODO: Wire up to database
    const playerTemplate = {
        name: {
            description: "Player's Name (i.e. SunlessKahn)",
            type: "text"
        },
        team: {
            name: {
                description: "Player's Team Name (i.e. Spacestation Gaming)",
                type: "text"
            },
            branding: {
                primary: {
                    description: "Team's Primary Color (i.e. #ffffff)",
                    type: "color" // Note, color here can be stroke or fill
                },
                secondary: {
                    description: "Team's Secondary Color (i.e. #ff0000)",
                    type: "color" // Note, color here can be stroke or fill
                },
                logo: {
                    description: "Team's Logo",
                    type: "image"
                }
            }
        },
        stats: {
            mvpr: {
                description: "A player's mvpr (i.e. 3.4)",
                type: "text"
            },
            shots: {
                description: "A player's shots (i.e. 3)",
                type: "text"
            },
            goals: {
                description: "A player's goals (i.e. 2)",
                type: "text"
            },
            assists: {
                description: "A player's assists (i.e. 1)",
                type: "text"
            },
            saves: {
                description: "A player's saves (i.e. 4)",
                type: "text"
            },
        }
    };
    const leagueTemplate = {
        name: {
            description: "Name of the league (i.e. Foundation)", // TODO: Should we have variants of this, or options? i.e. Foundation, Foundation League, FL, etc
            type: "text"
        },
        branding: {
            primary: {
                description: "League's Primary Color (i.e. #ffffff)",
                type: "color" // Note, color here can be stroke or fill
            },
            logo: {
                description: "League's Logo",
                type: "image"
            }
        }
    }

    return {body: {
        players: Array(5).fill(playerTemplate),
        league: leagueTemplate
    }}
    return {}
}
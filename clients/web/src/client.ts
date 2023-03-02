import {env} from "$env/dynamic/public";
import {HoudiniClient} from "$houdini";
import {createClient} from "graphql-ws";
import {subscription} from "$houdini/plugins";

export default new HoudiniClient({
    url: `${env.PUBLIC_GQL_URL}/graphql`,

    // uncomment this to configure the network call (for things like authentication)
    // for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
    fetchParams({session}) {
        console.log("We are making a request");
        return {
            headers: {
                authorization: session?.access ? `Bearer ${session.access}` : "",
            },
        };
    },
    plugins: [
        subscription((ctx) =>
            createClient({
                url: `${env.PUBLIC_GQL_URL}/graphql`,
                connectionParams: {
                    authorization: ctx.session?.access ? `Bearer ${ctx.session.access}` : "",
                }
            }),
        ),
    ],
});

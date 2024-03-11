import { HoudiniClient } from '$houdini';
import { apiUrl } from './lib/constants';

console.log(`Using Houdini API (client) @ ${apiUrl}`);
export default new HoudiniClient({
	url: `${apiUrl}/graphql`,
	

	// uncomment this to configure the network call (for things like authentication)
	// for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
	fetchParams() {
		return {
			credentials: 'include'
		};
	}
});

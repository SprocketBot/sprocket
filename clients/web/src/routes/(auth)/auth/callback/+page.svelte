<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	if (browser) {
		if (window.opener) {
			window.opener.postMessage('logged-in');
			window.close();
		} else {
            console.log("Escaping, opener is missing")
			goto('/');
		}
	}
</script>

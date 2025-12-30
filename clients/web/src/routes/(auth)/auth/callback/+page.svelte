<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	if (browser) {
		if (window.opener) {
			const urlParams = new URLSearchParams(window.location.search);
			const status = urlParams.get('status');
			const message = urlParams.get('message');
			if (status || message) {
				window.opener.postMessage(
					{
						status,
						message
					},
					'*'
				);
			} else {
				window.opener.postMessage('logged-in', '*');
			}
			window.close();
		} else {
			console.log('Escaping, opener is missing');
			goto('/');
		}
	}
</script>

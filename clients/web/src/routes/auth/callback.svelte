<script lang="ts">
    import {onMount} from "svelte";
  
    onMount(() => {
        
        const queryParams = JSON.parse(`{"${
            decodeURI(window.location.search.substr(1))
                .replace(/"/g, "\\\"")
                .replace(/&/g, "\",\"")
                .replace(/=/g, "\":\"")
        }"}`);
        if (window.opener) {
        // send them to the opening window
            window.opener.postMessage(queryParams);
            window.close();
        }
    });
  </script>
    
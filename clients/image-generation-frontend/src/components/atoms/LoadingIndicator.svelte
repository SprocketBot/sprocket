<script>
  import {onMount} from "svelte";
  let text = "";
  
  async function loop() {
      if (text.length === 3) text = "";
      text += ".";
      await new Promise(resolve => setTimeout(resolve, 300));
      loop();
  }
  
  onMount(() => {
      loop();
  });
    
  </script>

<div class="LoadingIndicator">
  {text}
</div>

<style>
  
</style>
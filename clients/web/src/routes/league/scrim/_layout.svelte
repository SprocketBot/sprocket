<script lang="ts" context="module">
  import type {LoadInput, LoadOutput} from "@sveltejs/kit";

  export function load({session}: LoadInput): LoadOutput {
      if (!session.user) {
          return {redirect: "/auth/login", status: 302};
      }
      return {};
  }
</script>

<slot/>
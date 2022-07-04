<script lang="ts" context="module">
  import type {LoadInput, LoadOutput} from "@sveltejs/kit";
  export async function load({
      fetch, params, session,
  }: LoadInput): Promise<LoadOutput> {
      // if session has imageType, we were redirected here with valid imageType already
      if (session.imageType) {
          return {
              props: {
                  imageTypeId: params.imageType,
                  name: params.name,
              },
          };
      }

      // check that imageType has a template with name params.name
      const response = await fetch(`/api/images/${params.imageType}`);
      const files: string[] = await response.json();
      if (!files.includes(params.name)) {
          return {
              status: 302,
              redirect: "/",
          };
      }

      return {
          props: {
              imageTypeId: params.imageType,
              name: params.name,
          },
      };
  }
</script>

<script lang="ts">
  import {session} from "$app/stores";

  import {downloadImage, getTemplate} from "$src/api";
  import LoadingBar from "$src/components/atoms/LoadingBar.svelte";
  import EditLayout from "$src/components/layouts/EditLayout.svelte";
  import Controls from "$src/components/organisms/Controls.svelte";
  import EditSidePanel from "$src/components/organisms/EditSidePanel.svelte";
  import Preview from "$src/components/organisms/Preview.svelte";
  import type {ImageType} from "$src/types";

  import {svgStringToPreviewEl} from "$src/utils/svgUtils";


  export let imageTypeId;
  export let name;

  async function getPreviewEl(): Promise<SVGElement> {
      return new Promise<SVGElement>((res, rej) => {
          if ($session.previewEl) {
              const el = $session.previewEl;
              delete $session.previewEl;
              res(el);
          }     else {
              downloadImage(imageTypeId, name).then(preview => {
                  try {
                      const previewEl = svgStringToPreviewEl(preview);
                      res(previewEl);
                  } catch (e) {
                      rej(e);
                  }
              })
                  .catch(e => {
                      rej(e);
                  });
          }
      });
  }
  
  async function getImageType(): Promise<ImageType> {
      return new Promise<any>((res, rej) => {
          if ($session.imageType) {
              const it = $session.imageType;
              delete $session.imageType;
              res(it);
          } else {
              getTemplate(imageTypeId).then(it => {
                  res(it);
              })
                  .catch(e => {
                      rej(e);
                  });
          }
      });
  }

</script>

<EditLayout>
  <div slot="preview">
    {#await getPreviewEl()}
      <LoadingBar direction="down" />
    {:then el}
      <Preview {el} />
    {/await}
  </div>
  <div slot="controls">
    <Controls filename={name} />
  </div>
  <div slot="sidePanel">
    {#await getImageType()}
      <h2>Getting Image Type</h2>
    {:then imageType}
      <EditSidePanel imTy={imageType} />
    {/await}
  </div>
</EditLayout>

<style lang="postcss">
  div {
    @apply h-full relative;
  }
</style>

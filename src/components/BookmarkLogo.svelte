<script lang="ts">
  let {
    heightProp = 232,
    fillprop = '#FFC400',
    strokeprop = '#2A1810'
  } = $props();

  /*
   * Original width = 172, height = 232
   * aspect ratio = 172 / 232 = 0.75
   */
  let widthProp = $derived(Math.round(heightProp * (172 / 232)));

</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="14 14 172 232"
  width={widthProp}
  height={heightProp}
  role="img"
  aria-label="Bite Marks bookmark logo"
>
  <title>Bite Marks — bitten bookmark</title>

  <path
    d="M 20 20&#xA;           L 180 20&#xA;           L 180 240&#xA;           L 100 200&#xA;           L 20 240&#xA;           L 20 169&#xA;           A 31 31 0 0 0 27.81 108&#xA;           A 31 31 0 0 0 20 47&#xA;           L 20 20 Z"
    fill={fillprop}
    stroke={strokeprop}
    stroke-width="10"
    stroke-linejoin="round"
    stroke-linecap="round"
  ></path>
</svg>

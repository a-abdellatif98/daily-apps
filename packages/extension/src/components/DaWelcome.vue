<template>
  <da-modal class="welcome-modal full" @close="$emit('close')" ref="modal">
    <da-svg src="/graphics/all_set.svg" class="welcome__graphics"/>
    <h1 class="overlap">Hello world</h1>
    <p>
      From now on, you can focus on code and
      we will search for dev news around the web for you.
    </p>
    <button class="btn btn-big btn-modal btn-invert" @click="$refs.modal.close()">
      Use Daily now
    </button>
  </da-modal>
</template>

<script>
import DaModal from '@daily/components/src/components/DaModal.vue';
import DaSvg from './DaSvg.vue';

export default {
  name: 'DaWelcome',
  components: {
    DaModal,
    DaSvg,
  },
};
</script>

<style>
.welcome-modal.modal .modal__container {
  background: linear-gradient(180deg, var(--color-ketchup-40) 0%, var(--color-bacon-80) 100%);

  & .welcome__graphics {
    height: 268px;
  }
}
</style>

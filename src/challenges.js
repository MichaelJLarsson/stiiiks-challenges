import { mount } from 'svelte';
import Challenges from './components/Challenges.svelte';

const app = mount(Challenges, {
  target: document.getElementById('app'),
});

export default app;

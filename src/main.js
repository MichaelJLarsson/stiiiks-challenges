import { mount } from 'svelte';
import Login from './components/Login.svelte';

const app = mount(Login, {
  target: document.getElementById('app'),
});

export default app;
